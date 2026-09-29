import { Injectable } from '@angular/core';
import { QrPayload } from '../models/qr-payload.model';
import { base64ToBytes, bytesToBase64 } from '../utilities/base64.utils';

const ITERATIONS = 310_000;

@Injectable({ providedIn: 'root' })
export class EncryptionService {
  generateSalt(): Uint8Array { return crypto.getRandomValues(new Uint8Array(16)); }
  generateIV(): Uint8Array { return crypto.getRandomValues(new Uint8Array(12)); }

  async deriveKey(password: string, salt: Uint8Array, iterations = ITERATIONS): Promise<CryptoKey> {
    const material = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'],
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  }

  async encryptMessage(message: string, password: string, options: {
    title?: string; expiresAt?: string | null; oneTime?: boolean;
  } = {}): Promise<QrPayload> {
    const salt = this.generateSalt();
    const iv = this.generateIV();
    const key = await this.deriveKey(password, salt);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource }, key, new TextEncoder().encode(message),
    );
    return {
      app: 'QRSecure', version: 1, algorithm: 'AES-GCM', kdf: 'PBKDF2',
      iterations: ITERATIONS, salt: bytesToBase64(salt), iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(new Uint8Array(encrypted)),
      createdAt: new Date().toISOString(), expiresAt: options.expiresAt ?? null,
      oneTime: options.oneTime ?? false, messageId: crypto.randomUUID(),
      ...(options.title?.trim() ? { title: options.title.trim() } : {}),
    };
  }

  async decryptMessage(payload: QrPayload, password: string): Promise<string> {
    try {
      const key = await this.deriveKey(password, base64ToBytes(payload.salt), payload.iterations);
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: base64ToBytes(payload.iv) as BufferSource },
        key,
        base64ToBytes(payload.ciphertext) as BufferSource,
      );
      return new TextDecoder().decode(decrypted);
    } catch {
      throw new Error('Incorrect password or invalid encrypted message.');
    }
  }
}
