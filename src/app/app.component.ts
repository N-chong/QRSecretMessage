import { Component, OnDestroy, OnInit } from '@angular/core';
import { App, AppState } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';
import { AuthService } from './services/auth.service';
import { StorageService } from './services/storage.service';
import { ThemeService } from './services/theme.service';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  private appStateListener?: PluginListenerHandle;
  constructor(private auth: AuthService, private storage: StorageService, private theme: ThemeService) {}
  async ngOnInit(): Promise<void> {
    const settings = await this.storage.getSettings();
    this.theme.apply(settings.theme);
    this.appStateListener = await App.addListener('appStateChange', (state: AppState) => void this.handleState(state));
  }
  ngOnDestroy(): void { void this.appStateListener?.remove(); }
  private async handleState(state: AppState): Promise<void> {
    if (!state.isActive) { if (this.auth.isAuthenticated()) this.auth.noteBackground(); return; }
    if (!this.auth.isAuthenticated()) return;
    const { autoLock } = await this.storage.getSettings();
    const delays = { immediately: 0, '30seconds': 30_000, '1minute': 60_000, '5minutes': 300_000 };
    if (this.auth.shouldLockOnResume(delays[autoLock])) await this.auth.lockApp();
  }
}
