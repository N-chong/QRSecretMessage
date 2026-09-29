export type PasswordStrength = 'Weak' | 'Medium' | 'Strong';

export function passwordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score >= 4) return 'Strong';
  if (score >= 2) return 'Medium';
  return 'Weak';
}

export function isValidPin(pin: string): boolean {
  return /^(\d{4}|\d{6})$/.test(pin);
}
