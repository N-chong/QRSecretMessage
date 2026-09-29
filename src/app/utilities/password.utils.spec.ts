import { describe, expect, it } from 'vitest';
import { isValidPin, passwordStrength } from './password.utils';

describe('password utilities', () => {
  it('accepts only four- or six-digit PINs', () => {
    expect(isValidPin('1234')).toBe(true);
    expect(isValidPin('123456')).toBe(true);
    expect(isValidPin('12345')).toBe(false);
    expect(isValidPin('12ab')).toBe(false);
  });
  it('rates a complex long password as strong', () => expect(passwordStrength('LongSecret123!')).toBe('Strong'));
});
