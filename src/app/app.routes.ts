import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'lock', loadComponent: () => import('./pages/lock/lock.page').then((m) => m.LockPage) },
  { path: 'home', canActivate: [authGuard], loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage) },
  { path: 'create', canActivate: [authGuard], loadComponent: () => import('./pages/create-qr/create-qr.page').then((m) => m.CreateQrPage) },
  { path: 'scan', canActivate: [authGuard], loadComponent: () => import('./pages/scan-qr/scan-qr.page').then((m) => m.ScanQrPage) },
  { path: 'upload', canActivate: [authGuard], loadComponent: () => import('./pages/upload-qr/upload-qr.page').then((m) => m.UploadQrPage) },
  { path: 'decrypt', canActivate: [authGuard], loadComponent: () => import('./pages/decrypt/decrypt.page').then((m) => m.DecryptPage) },
  { path: 'history', canActivate: [authGuard], loadComponent: () => import('./pages/history/history.page').then((m) => m.HistoryPage) },
  { path: 'settings', canActivate: [authGuard], loadComponent: () => import('./pages/settings/settings.page').then((m) => m.SettingsPage) },
  { path: 'about', canActivate: [authGuard], loadComponent: () => import('./pages/about/about.page').then((m) => m.AboutPage) },
  { path: '', redirectTo: 'lock', pathMatch: 'full' },
  { path: '**', redirectTo: 'lock' },
];
