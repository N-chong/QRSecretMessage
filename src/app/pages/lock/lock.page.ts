import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonNote, IonSpinner, IonToggle } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { fingerPrintOutline, lockClosedOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { BiometricService } from '../../services/biometric.service';
import { StorageService } from '../../services/storage.service';

@Component({ selector: 'app-lock', standalone: true, imports: [FormsModule, IonButton, IonContent, IonIcon, IonInput, IonItem, IonNote, IonSpinner, IonToggle], templateUrl: './lock.page.html', styleUrl: './lock.page.scss' })
export class LockPage implements OnInit {
  setup = false; pinMode = false; busy = true; biometricAvailable = false;
  pin = ''; confirmPin = ''; enableBiometric = false; error = '';
  constructor(private auth: AuthService, private biometric: BiometricService, private storage: StorageService, private router: Router) {
    addIcons({ fingerPrintOutline, lockClosedOutline, shieldCheckmarkOutline });
  }
  async ngOnInit(): Promise<void> {
    this.setup = !(await this.auth.hasPin());
    this.biometricAvailable = await this.biometric.isBiometricAvailable();
    if (!this.setup) {
      const settings = await this.storage.getSettings();
      this.pinMode = !settings.biometricEnabled;
      if (settings.biometricEnabled && this.biometricAvailable) await this.authenticateBiometric();
      else this.busy = false;
    } else this.busy = false;
  }
  async completeSetup(): Promise<void> {
    this.error = '';
    if (this.pin !== this.confirmPin) { this.error = 'PINs do not match.'; return; }
    this.busy = true;
    try {
      await this.auth.setupPin(this.pin);
      if (this.enableBiometric) await this.biometric.enableBiometric();
      this.auth.unlockApp(); this.clear(); await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (error) { this.error = error instanceof Error ? error.message : 'Unable to finish setup.'; }
    finally { this.busy = false; }
  }
  async unlockPin(): Promise<void> {
    this.error = ''; this.busy = true;
    try {
      if (await this.auth.verifyPin(this.pin)) { this.clear(); await this.router.navigateByUrl('/home', { replaceUrl: true }); }
      else this.error = 'Incorrect PIN.';
    } catch (error) { this.error = error instanceof Error ? error.message : 'Incorrect PIN.'; }
    finally { this.pin = ''; this.busy = false; }
  }
  async authenticateBiometric(): Promise<void> {
    this.busy = true; this.error = '';
    if (await this.biometric.authenticate()) { this.auth.unlockApp(); await this.router.navigateByUrl('/home', { replaceUrl: true }); }
    else { this.error = 'Fingerprint authentication failed.'; this.pinMode = true; }
    this.busy = false;
  }
  private clear(): void { this.pin = ''; this.confirmPin = ''; }
}
