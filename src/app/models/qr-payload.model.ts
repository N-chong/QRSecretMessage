export interface QrPayload {
  app: 'QRSecure';
  version: 1;
  algorithm: 'AES-GCM';
  kdf: 'PBKDF2';
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
  createdAt: string;
  expiresAt: string | null;
  oneTime: boolean;
  messageId: string;
  title?: string;
}
