import { Injectable } from '@angular/core';
import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { QrPayload } from '../models/qr-payload.model';
import { ValidationService, ValidationResult } from './validation.service';

@Injectable({ providedIn: 'root' })
export class QrService {
  constructor(private validation: ValidationService) {}

  generateQRCode(payload: QrPayload): Promise<string> {
    return QRCode.toDataURL(JSON.stringify(payload), {
      errorCorrectionLevel: 'M', margin: 2, width: 900,
      color: { dark: '#102a43', light: '#ffffff' },
    });
  }

  async scanQRCode(): Promise<string> {
    const status = await BarcodeScanner.requestPermissions();
    if (status.camera !== 'granted') throw new Error('Camera permission is required.');
    const result = await BarcodeScanner.scan({ formats: [BarcodeFormat.QrCode] });
    const raw = result.barcodes[0]?.rawValue;
    if (!raw) throw new Error('No QR code was detected.');
    return raw;
  }

  async decodeQRFromImage(file: Blob): Promise<string> {
    try {
      const result = await BarcodeScanner.readBarcodesFromImage({ blob: file, formats: [BarcodeFormat.QrCode] });
      const raw = result.barcodes[0]?.rawValue;
      if (raw) return raw;
    } catch { /* use the JavaScript fallback */ }
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width; canvas.height = bitmap.height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('No QR code was detected in the selected image.');
    context.drawImage(bitmap, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    const decoded = jsQR(pixels.data, pixels.width, pixels.height);
    if (!decoded?.data) throw new Error('No QR code was detected in the selected image.');
    return decoded.data;
  }

  parseQRPayload(raw: string): ValidationResult { return this.validation.parsePayload(raw); }
}
