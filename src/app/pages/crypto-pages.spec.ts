import { describe, expect, it, vi } from 'vitest';
import { QrPayload } from '../models/qr-payload.model';
import { CreateQrPage } from './create-qr/create-qr.page';
import { DecryptPage } from './decrypt/decrypt.page';

const payload: QrPayload = {
  app: 'QRSecure', version: 1, algorithm: 'AES-GCM', kdf: 'PBKDF2', iterations: 310_000,
  salt: 'c2FsdA==', iv: 'aXYxMjM0NTY3ODkw', ciphertext: 'Y2lwaGVy',
  createdAt: new Date().toISOString(), expiresAt: null, oneTime: false, messageId: 'message-1', title: 'Test',
};

describe('crypto page rendering', () => {
  it('publishes the generated QR after encryption completes', async () => {
    const changeDetector = { detectChanges: vi.fn(), destroyed: false };
    const page = new CreateQrPage(
      { encryptMessage: vi.fn().mockResolvedValue(payload) } as never,
      { generateQRCode: vi.fn().mockResolvedValue('data:image/png;base64,qr') } as never,
      { saveMessage: vi.fn().mockResolvedValue(undefined) } as never,
      {} as never,
      changeDetector as never,
    );
    page.message = 'secret'; page.password = 'Password1!'; page.confirmPassword = 'Password1!';
    await page.encrypt();
    expect(page.qrDataUrl).toContain('data:image/png');
    expect(page.busy).toBe(false);
    expect(changeDetector.detectChanges).toHaveBeenCalled();
  });

  it('publishes plaintext after decryption completes', async () => {
    const changeDetector = { detectChanges: vi.fn(), destroyed: false };
    const page = new DecryptPage(
      {} as never,
      { decryptMessage: vi.fn().mockResolvedValue('revealed') } as never,
      { getMessages: vi.fn().mockResolvedValue([]), saveMessage: vi.fn().mockResolvedValue(undefined) } as never,
      {} as never,
      {} as never,
      changeDetector as never,
    );
    page.payload = payload; page.password = 'Password1!';
    await page.decrypt();
    expect(page.plaintext).toBe('revealed');
    expect(page.busy).toBe(false);
    expect(changeDetector.detectChanges).toHaveBeenCalled();
  });
});
