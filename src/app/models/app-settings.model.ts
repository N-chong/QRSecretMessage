export type ThemeMode = 'light' | 'dark' | 'system';
export type AutoLockMode = 'immediately' | '30seconds' | '1minute' | '5minutes';

export interface AppSettings {
  theme: ThemeMode;
  biometricEnabled: boolean;
  autoLock: AutoLockMode;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  biometricEnabled: false,
  autoLock: 'immediately',
};
