import { QrPayload } from './qr-payload.model';

export interface SecureMessageRecord {
  id: string;
  title: string;
  createdAt: string;
  expiresAt: string | null;
  type: 'created' | 'scanned';
  ciphertext: string;
  salt: string;
  iv: string;
  opened: boolean;
  oneTime: boolean;
  payload: QrPayload;
}
