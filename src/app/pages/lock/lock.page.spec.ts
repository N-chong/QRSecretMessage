import { describe, expect, it, vi } from 'vitest';
import { LockPage } from './lock.page';

describe('LockPage first-run initialization', () => {
  it('shows PIN setup without waiting for the biometric plugin', async () => {
    const auth = { hasPin: vi.fn().mockResolvedValue(false) };
    const biometric = { isBiometricAvailable: vi.fn(() => new Promise<boolean>(() => undefined)) };
    const storage = { getSettings: vi.fn() };
    const router = { navigateByUrl: vi.fn() };
    const changeDetector = { detectChanges: vi.fn(), destroyed: false };
    const page = new LockPage(auth as never, biometric as never, storage as never, router as never, changeDetector as never);

    await page.initializeLock();

    expect(page.busy).toBe(false);
    expect(page.setup).toBe(true);
    expect(page.initializationFailed).toBe(false);
    expect(storage.getSettings).not.toHaveBeenCalled();
    expect(changeDetector.detectChanges).toHaveBeenCalled();
  });
});
