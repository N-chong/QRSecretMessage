import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonNote, IonSelect, IonSelectOption, IonTitle, IonToggle, IonToolbar } from '@ionic/angular';
import { AppSettings, AutoLockMode, DEFAULT_SETTINGS, ThemeMode } from '../../models/app-settings.model';
import { AuthService } from '../../services/auth.service';
import { BiometricService } from '../../services/biometric.service';
import { StorageService } from '../../services/storage.service';
import { ThemeService } from '../../services/theme.service';

@Component({ selector: 'app-settings', standalone: true, imports: [FormsModule, RouterLink, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonNote, IonSelect, IonSelectOption, IonTitle, IonToggle, IonToolbar], templateUrl: './settings.page.html', styleUrl: './settings.page.scss' })
export class SettingsPage implements OnInit {
  settings: AppSettings = { ...DEFAULT_SETTINGS }; loading = true; biometricAvailable = false; changingPin = false; currentPin = ''; newPin = ''; confirmPin = ''; message = ''; error = '';
  constructor(private storage: StorageService, private auth: AuthService, private biometric: BiometricService, private theme: ThemeService, private changeDetector: ChangeDetectorRef) {}
  async ngOnInit(): Promise<void> {
    try { this.settings = await this.storage.getSettings(); }
    catch { this.error = 'Unable to load saved settings.'; }
    finally { this.loading = false; this.refreshView(); }
    this.biometricAvailable = await this.biometric.isBiometricAvailable();
    this.refreshView();
  }
  async toggleBiometric(enabled: boolean): Promise<void> {
    this.error = ''; try { enabled ? await this.biometric.enableBiometric() : await this.biometric.disableBiometric(); this.settings.biometricEnabled = enabled; }
    catch (error) { this.settings.biometricEnabled = false; this.error = error instanceof Error ? error.message : 'Unable to update fingerprint setting.'; }
    finally { this.refreshView(); }
  }
  async setAutoLock(value: AutoLockMode): Promise<void> { this.settings = await this.storage.updateSettings({ autoLock: value }); this.refreshView(); }
  async setTheme(value: ThemeMode): Promise<void> { this.settings = await this.storage.updateSettings({ theme: value }); this.theme.apply(value); this.refreshView(); }
  async changePin(): Promise<void> {
    this.error = ''; this.message = '';
    if (this.newPin !== this.confirmPin) { this.error = 'PINs do not match.'; return; }
    try { await this.auth.changePin(this.currentPin, this.newPin); this.message = 'App PIN changed.'; this.changingPin = false; this.clearPins(); }
    catch (error) { this.error = error instanceof Error ? error.message : 'Unable to change PIN.'; }
    finally { this.refreshView(); }
  }
  async clearHistory(): Promise<void> { if (window.confirm('Delete all encrypted history records?')) { await this.storage.clearHistory(); this.message = 'History cleared.'; this.refreshView(); } }
  private clearPins(): void { this.currentPin = ''; this.newPin = ''; this.confirmPin = ''; }
  private refreshView(): void { if (!(this.changeDetector as unknown as { destroyed?: boolean }).destroyed) this.changeDetector.detectChanges(); }
}
