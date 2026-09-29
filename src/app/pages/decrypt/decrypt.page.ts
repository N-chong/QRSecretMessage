import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonNote, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { copyOutline, eyeOffOutline, eyeOutline, lockOpenOutline } from 'ionicons/icons';
import { QrPayload } from '../../models/qr-payload.model';
import { SecureMessageRecord } from '../../models/secure-message.model';
import { EncryptionService } from '../../services/encryption.service';
import { QrContextService } from '../../services/qr-context.service';
import { ShareService } from '../../services/share.service';
import { StorageService } from '../../services/storage.service';

@Component({ selector: 'app-decrypt', standalone: true, imports: [FormsModule, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonNote, IonTitle, IonToolbar], templateUrl: './decrypt.page.html', styleUrl: './decrypt.page.scss' })
export class DecryptPage implements OnInit, OnDestroy {
  payload: QrPayload | null = null; password = ''; plaintext = ''; showPassword = false; busy = false; error = ''; copied = false; alreadyOpened = false;
  constructor(private context: QrContextService, private encryption: EncryptionService, private storage: StorageService, private share: ShareService, private router: Router, private changeDetector: ChangeDetectorRef) { addIcons({ copyOutline, eyeOffOutline, eyeOutline, lockOpenOutline }); }
  async ngOnInit(): Promise<void> {
    try {
      this.payload = this.context.get();
      if (!this.payload) { await this.router.navigateByUrl('/scan'); return; }
      const record = (await this.storage.getMessages()).find((item) => item.id === this.payload?.messageId);
      this.alreadyOpened = !!(this.payload.oneTime && record?.opened);
    } finally { this.refreshView(); }
  }
  async decrypt(): Promise<void> {
    if (!this.payload || this.alreadyOpened) return;
    this.error = ''; this.busy = true;
    try {
      this.plaintext = await this.encryption.decryptMessage(this.payload, this.password);
      const existing = (await this.storage.getMessages()).find((item) => item.id === this.payload?.messageId);
      if (existing) await this.storage.updateMessage(existing.id, { opened: this.payload.oneTime || existing.opened });
      else {
        const record: SecureMessageRecord = { id: this.payload.messageId, title: this.payload.title || 'Scanned secret', createdAt: this.payload.createdAt, expiresAt: this.payload.expiresAt, type: 'scanned', ciphertext: this.payload.ciphertext, salt: this.payload.salt, iv: this.payload.iv, opened: this.payload.oneTime, oneTime: this.payload.oneTime, payload: this.payload };
        await this.storage.saveMessage(record);
      }
      this.password = '';
    } catch (error) { this.error = error instanceof Error ? error.message : 'Incorrect password or invalid encrypted message.'; this.password = ''; }
    finally { this.busy = false; this.refreshView(); }
  }
  async copy(): Promise<void> { await this.share.copy(this.plaintext); this.copied = true; this.refreshView(); }
  close(): void { this.plaintext = ''; this.password = ''; this.context.clear(); void this.router.navigateByUrl('/home'); }
  ngOnDestroy(): void { this.plaintext = ''; this.password = ''; }
  private refreshView(): void {
    if (!(this.changeDetector as unknown as { destroyed?: boolean }).destroyed) this.changeDetector.detectChanges();
  }
}
