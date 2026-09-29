import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  initializationFailed = false;
  pin = ''; confirmPin = ''; enableBiometric = false; error = '';
  constructor(private auth: AuthService, private biometric: BiometricService, private storage: StorageService, private router: Router, private changeDetector: ChangeDetectorRef) {
    addIcons({ fingerPrintOutline, lockClosedOutline, shieldCheckmarkOutline });
  }
  async ngOnInit(): Promise<void> {
    await this.initializeLock();
  }
  async initializeLock(): Promise<void> {
    this.busy = true; this.error = ''; this.initializationFailed = false;
    try {
      this.setup = !(await this.auth.hasPin());
      if (this.setup) {
        this.pinMode = true;
        void this.withTimeout(this.biometric.isBiometricAvailable(), false)
          .then((available) => { this.biometricAvailable = available; this.refreshView(); });
        return;
      }
      const settings = await this.withTimeout(this.storage.getSettings());
      this.pinMode = true;
      if (settings.biometricEnabled) {
        this.biometricAvailable = await this.withTimeout(this.biometric.isBiometricAvailable(), false);
        if (this.biometricAvailable) await this.authenticateBiometric();
      }
    } catch (error) {
      this.initializationFailed = true;
      this.error = error instanceof Error ? error.message : 'Unable to initialize the secure app lock.';
    } finally { this.busy = false; this.refreshView(); }
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
    finally { this.busy = false; this.refreshView(); }
  }
  async unlockPin(): Promise<void> {
    this.error = ''; this.busy = true;
    try {
      if (await this.auth.verifyPin(this.pin)) { this.clear(); await this.router.navigateByUrl('/home', { replaceUrl: true }); }
      else this.error = 'Incorrect PIN.';
    } catch (error) { this.error = error instanceof Error ? error.message : 'Incorrect PIN.'; }
    finally { this.pin = ''; this.busy = false; this.refreshView(); }
  }
  async authenticateBiometric(): Promise<void> {
    this.busy = true; this.error = '';
    if (await this.biometric.authenticate()) { this.auth.unlockApp(); await this.router.navigateByUrl('/home', { replaceUrl: true }); }
    else { this.error = 'Fingerprint authentication failed.'; this.pinMode = true; }
    this.busy = false; this.refreshView();
  }
  private clear(): void { this.pin = ''; this.confirmPin = ''; }
  private refreshView(): void {
    if (!(this.changeDetector as unknown as { destroyed?: boolean }).destroyed) this.changeDetector.detectChanges();
  }
  private async withTimeout<T>(operation: Promise<T>, fallback?: T): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<T>((resolve, reject) => {
      timeoutId = setTimeout(() => fallback === undefined ? reject(new Error('Unable to initialize the secure app lock.')) : resolve(fallback), 8_000);
    });
    try { return await Promise.race([operation, timeout]); }
    finally { if (timeoutId) clearTimeout(timeoutId); }
  }
}
