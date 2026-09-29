import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonNote, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, cloudUploadOutline, imageOutline } from 'ionicons/icons';
import { QrContextService } from '../../services/qr-context.service';
import { QrService } from '../../services/qr.service';

@Component({ selector: 'app-upload-qr', standalone: true, imports: [IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonNote, IonTitle, IonToolbar], templateUrl: './upload-qr.page.html', styleUrl: './upload-qr.page.scss' })
export class UploadQrPage {
  file: File | null = null; preview = ''; busy = false; error = ''; valid = false;
  constructor(private qr: QrService, private context: QrContextService, private router: Router, private changeDetector: ChangeDetectorRef) { addIcons({ checkmarkCircleOutline, cloudUploadOutline, imageOutline }); }
  choose(event: Event): void {
    const input = event.target as HTMLInputElement; this.file = input.files?.[0] ?? null; this.error = ''; this.valid = false;
    if (this.preview) URL.revokeObjectURL(this.preview);
    this.preview = this.file ? URL.createObjectURL(this.file) : '';
  }
  async decode(): Promise<void> {
    if (!this.file) return; this.busy = true; this.error = '';
    try {
      const raw = await this.qr.decodeQRFromImage(this.file);
      const result = this.qr.parseQRPayload(raw);
      if (!result.valid || !result.payload) { this.error = result.error || 'Invalid Secure QR Code.'; return; }
      this.valid = true; this.context.set(result.payload); setTimeout(() => void this.router.navigateByUrl('/decrypt'), 500);
    } catch (error) { this.error = error instanceof Error ? error.message : 'No QR code was detected in the selected image.'; }
    finally { this.busy = false; this.changeDetector.detectChanges(); }
  }
}
