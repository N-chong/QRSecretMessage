import { Injectable } from '@angular/core';
import { ThemeMode } from '../models/app-settings.model';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  apply(theme: ThemeMode): void {
    const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('ion-palette-dark', dark);
    document.documentElement.dataset['theme'] = theme;
  }
}
