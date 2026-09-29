import { Injectable } from '@angular/core';
import { QrPayload } from '../models/qr-payload.model';

@Injectable({ providedIn: 'root' })
export class QrContextService {
  private readonly key = 'qrsecure_pending_payload';
  set(payload: QrPayload): void { sessionStorage.setItem(this.key, JSON.stringify(payload)); }
  get(): QrPayload | null {
    const value = sessionStorage.getItem(this.key);
    if (!value) return null;
    try { return JSON.parse(value) as QrPayload; } catch { return null; }
  }
  clear(): void { sessionStorage.removeItem(this.key); }
}
