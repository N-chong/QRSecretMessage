import { Injectable } from '@angular/core';
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class BiometricService {
  constructor(private storage: StorageService) {}

  async isBiometricAvailable(): Promise<boolean> {
    try { return (await BiometricAuth.checkBiometry()).isAvailable; } catch { return false; }
  }

  async authenticate(): Promise<boolean> {
    try {
      await BiometricAuth.authenticate({
        reason: 'Unlock QRSecure', androidTitle: 'Unlock QRSecure',
        androidSubtitle: 'Confirm your identity', cancelTitle: 'Use PIN Instead',
        allowDeviceCredential: false,
      });
      return true;
    } catch { return false; }
  }

  async enableBiometric(): Promise<void> {
    if (!(await this.isBiometricAvailable())) throw new Error('Biometric authentication is not available on this device.');
    if (!(await this.authenticate())) throw new Error('Fingerprint authentication failed.');
    await this.storage.updateSettings({ biometricEnabled: true });
  }

  async disableBiometric(): Promise<void> { await this.storage.updateSettings({ biometricEnabled: false }); }
}
