import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonNote, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToggle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, copyOutline, downloadOutline, eyeOffOutline, eyeOutline, shareSocialOutline } from 'ionicons/icons';
import { SecureMessageRecord } from '../../models/secure-message.model';
import { EncryptionService } from '../../services/encryption.service';
import { QrService } from '../../services/qr.service';
import { ShareService } from '../../services/share.service';
import { StorageService } from '../../services/storage.service';
import { PasswordStrength, passwordStrength } from '../../utilities/password.utils';

@Component({ selector: 'app-create-qr', standalone: true, imports: [FormsModule, IonBackButton, IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonNote, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToggle, IonToolbar], templateUrl: './create-qr.page.html', styleUrl: './create-qr.page.scss' })
export class CreateQrPage {
  title = ''; message = ''; password = ''; confirmPassword = ''; showPassword = false;
  expiration = 'none'; customExpiration = ''; oneTime = false; busy = false; error = ''; success = '';
  qrDataUrl = ''; encryptedJson = '';
  constructor(private encryption: EncryptionService, private qr: QrService, private storage: StorageService, private share: ShareService) { addIcons({ checkmarkCircleOutline, copyOutline, downloadOutline, eyeOffOutline, eyeOutline, shareSocialOutline }); }
  get strength(): PasswordStrength { return passwordStrength(this.password); }
  async encrypt(): Promise<void> {
    this.error = ''; this.success = '';
    if (!this.message.trim()) { this.error = 'Please enter a message.'; return; }
    if (this.password.length < 8) { this.error = 'Use a message password with at least 8 characters.'; return; }
    if (this.password !== this.confirmPassword) { this.error = 'Passwords do not match.'; return; }
    this.busy = true;
    try {
      const payload = await this.encryption.encryptMessage(this.message, this.password, { title: this.title, expiresAt: this.expirationDate(), oneTime: this.oneTime });
      this.encryptedJson = JSON.stringify(payload);
      this.qrDataUrl = await this.qr.generateQRCode(payload);
      const record: SecureMessageRecord = { id: payload.messageId, title: payload.title || 'Untitled secret', createdAt: payload.createdAt, expiresAt: payload.expiresAt, type: 'created', ciphertext: payload.ciphertext, salt: payload.salt, iv: payload.iv, opened: false, oneTime: payload.oneTime, payload };
      await this.storage.saveMessage(record);
      this.message = ''; this.password = ''; this.confirmPassword = '';
    } catch { this.error = 'Unable to generate QR code.'; }
    finally { this.busy = false; }
  }
  async copyJson(): Promise<void> { await this.share.copy(this.encryptedJson); this.success = 'Encrypted JSON copied.'; }
  async save(): Promise<void> { try { await this.share.saveQr(this.qrDataUrl); this.success = 'QR image saved to Documents.'; } catch { this.error = 'Unable to save QR image.'; } }
  async shareQr(): Promise<void> { try { await this.share.shareQr(this.qrDataUrl); } catch { this.error = 'Unable to share QR image.'; } }
  reset(): void { this.qrDataUrl = ''; this.encryptedJson = ''; this.title = ''; this.expiration = 'none'; this.oneTime = false; this.success = ''; }
  private expirationDate(): string | null {
    const durations: Record<string, number> = { '1hour': 3_600_000, '24hours': 86_400_000, '7days': 604_800_000 };
    if (this.expiration === 'none') return null;
    if (this.expiration === 'custom') return this.customExpiration ? new Date(this.customExpiration).toISOString() : null;
    return new Date(Date.now() + durations[this.expiration]).toISOString();
  }
}
