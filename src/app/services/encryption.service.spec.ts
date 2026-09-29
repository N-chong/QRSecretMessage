import { describe, expect, it } from 'vitest';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  const service = new EncryptionService();

  it('round-trips plaintext with the correct password', async () => {
    const payload = await service.encryptMessage('Meeting is at 3 PM.', 'MySecret123!');
    expect(payload.ciphertext).not.toContain('Meeting');
    await expect(service.decryptMessage(payload, 'MySecret123!')).resolves.toBe('Meeting is at 3 PM.');
  });

  it('does not decrypt with the wrong password', async () => {
    const payload = await service.encryptMessage('classified', 'CorrectPassword1!');
    await expect(service.decryptMessage(payload, 'WrongPassword1!')).rejects.toThrow('Incorrect password or invalid encrypted message.');
  });

  it('uses fresh salt and IV values', async () => {
    const first = await service.encryptMessage('same', 'SamePassword1!');
    const second = await service.encryptMessage('same', 'SamePassword1!');
    expect(first.salt).not.toBe(second.salt);
    expect(first.iv).not.toBe(second.iv);
    expect(first.ciphertext).not.toBe(second.ciphertext);
  });
});
