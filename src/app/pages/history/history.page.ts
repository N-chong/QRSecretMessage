import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonBackButton, IonBadge, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { lockClosedOutline, searchOutline, trashOutline } from 'ionicons/icons';
import { SecureMessageRecord } from '../../models/secure-message.model';
import { QrContextService } from '../../services/qr-context.service';
import { StorageService } from '../../services/storage.service';

@Component({ selector: 'app-history', standalone: true, imports: [DatePipe, FormsModule, IonBackButton, IonBadge, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar], templateUrl: './history.page.html', styleUrl: './history.page.scss' })
export class HistoryPage implements OnInit {
  messages: SecureMessageRecord[] = []; search = ''; sort = 'newest';
  constructor(private storage: StorageService, private context: QrContextService, private router: Router, private changeDetector: ChangeDetectorRef) { addIcons({ lockClosedOutline, searchOutline, trashOutline }); }
  async ngOnInit(): Promise<void> { await this.load(); }
  get filtered(): SecureMessageRecord[] {
    const query = this.search.toLowerCase();
    return this.messages.filter((item) => item.title.toLowerCase().includes(query)).sort((a, b) => this.sort === 'newest' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt));
  }
  status(item: SecureMessageRecord): string { if (item.expiresAt && new Date(item.expiresAt).getTime() <= Date.now()) return 'Expired'; if (item.oneTime && item.opened) return 'Opened'; return 'Available'; }
  open(item: SecureMessageRecord): void { this.context.set(item.payload); void this.router.navigateByUrl('/decrypt'); }
  async remove(event: Event, id: string): Promise<void> { event.stopPropagation(); await this.storage.deleteMessage(id); await this.load(); }
  async clear(): Promise<void> { if (window.confirm('Delete all encrypted history records?')) { await this.storage.clearHistory(); await this.load(); } }
  private async load(): Promise<void> { this.messages = await this.storage.getMessages(); this.changeDetector.detectChanges(); }
}
