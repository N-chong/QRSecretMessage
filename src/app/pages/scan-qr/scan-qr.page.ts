import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonNote, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cameraOutline, flashOutline, qrCodeOutline, syncOutline } from 'ionicons/icons';
import { QrContextService } from '../../services/qr-context.service';
import { QrService } from '../../services/qr.service';

@Component({ selector: 'app-scan-qr', standalone: true, imports: [IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonNote, IonTitle, IonToolbar], templateUrl: './scan-qr.page.html', styleUrl: './scan-qr.page.scss' })
export class ScanQrPage {
  busy = false; error = '';
  constructor(private qr: QrService, private context: QrContextService, private router: Router, private changeDetector: ChangeDetectorRef) { addIcons({ cameraOutline, flashOutline, qrCodeOutline, syncOutline }); }
  async scan(): Promise<void> {
    this.error = ''; this.busy = true;
    try {
      const raw = await this.qr.scanQRCode();
      const result = this.qr.parseQRPayload(raw);
      if (!result.valid || !result.payload) { this.error = result.error || 'Invalid Secure QR Code.'; return; }
      this.context.set(result.payload); await this.router.navigateByUrl('/decrypt');
    } catch (error) { this.error = error instanceof Error ? error.message : 'Unable to scan QR code.'; }
    finally { this.busy = false; this.changeDetector.detectChanges(); }
  }
}
