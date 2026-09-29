import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { base64ToBytes, bytesToBase64 } from '../utilities/base64.utils';
import { isValidPin } from '../utilities/password.utils';

interface PinRecord { salt: string; hash: string; iterations: number; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly pinKey = 'app_pin_verifier';
  private readonly auth = signal(false);
  private failedAttempts = 0;
  private retryAfter = 0;
  private backgroundAt: number | null = null;

  constructor(private router: Router) {}

  isAuthenticated(): boolean { return this.auth(); }
  async hasPin(): Promise<boolean> {
    await SecureStorage.setKeyPrefix('qrsecure_');
    return (await this.withTimeout(SecureStorage.get(this.pinKey))) !== null;
  }

  async setupPin(pin: string): Promise<void> {
    await SecureStorage.setKeyPrefix('qrsecure_');
    if (!isValidPin(pin)) throw new Error('PIN must contain exactly 4 or 6 digits.');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iterations = 210_000;
    const hash = await this.hashPin(pin, salt, iterations);
    await this.withTimeout(SecureStorage.set(this.pinKey, { salt: bytesToBase64(salt), hash: bytesToBase64(hash), iterations }));
  }

  async verifyPin(pin: string): Promise<boolean> {
    await SecureStorage.setKeyPrefix('qrsecure_');
    if (Date.now() < this.retryAfter) throw new Error(`Try again in ${Math.ceil((this.retryAfter - Date.now()) / 1000)} seconds.`);
    const stored = await this.withTimeout(SecureStorage.get(this.pinKey)) as PinRecord | null;
    if (!stored) return false;
    const actual = await this.hashPin(pin, base64ToBytes(stored.salt), stored.iterations);
    const expected = base64ToBytes(stored.hash);
    let difference = actual.length ^ expected.length;
    for (let i = 0; i < Math.min(actual.length, expected.length); i++) difference |= actual[i] ^ expected[i];
    if (difference === 0) {
      this.failedAttempts = 0; this.retryAfter = 0; this.unlockApp(); return true;
    }
    this.failedAttempts++;
    if (this.failedAttempts >= 5) {
      const delay = Math.min(300, 30 * 2 ** Math.floor((this.failedAttempts - 5) / 3));
      this.retryAfter = Date.now() + delay * 1000;
    }
    return false;
  }

  async changePin(currentPin: string, newPin: string): Promise<void> {
    if (!(await this.verifyPin(currentPin))) throw new Error('Incorrect PIN.');
    await this.setupPin(newPin);
  }

  unlockApp(): void { this.auth.set(true); }
  async lockApp(): Promise<void> { this.auth.set(false); await this.router.navigateByUrl('/lock', { replaceUrl: true }); }
  noteBackground(): void { this.backgroundAt = Date.now(); }
  shouldLockOnResume(timeoutMs: number): boolean {
    if (this.backgroundAt === null) return false;
    const elapsed = Date.now() - this.backgroundAt;
    this.backgroundAt = null;
    return elapsed >= timeoutMs;
  }

  private async hashPin(pin: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations }, material, 256,
    );
    return new Uint8Array(bits);
  }

  private async withTimeout<T>(operation: Promise<T>, milliseconds = 8_000): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Secure storage is not responding. Please restart QRSecure and try again.')), milliseconds);
    });
    try { return await Promise.race([operation, timeout]); }
    finally { if (timeoutId) clearTimeout(timeoutId); }
  }
}
