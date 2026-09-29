import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addCircleOutline, cameraOutline, cloudUploadOutline, timeOutline, lockClosedOutline, settingsOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({ selector: 'app-home', standalone: true, imports: [RouterLink, IonButton, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar], templateUrl: './home.page.html', styleUrl: './home.page.scss' })
export class HomePage {
  constructor(private auth: AuthService) { addIcons({ addCircleOutline, cameraOutline, cloudUploadOutline, timeOutline, lockClosedOutline, settingsOutline, shieldCheckmarkOutline }); }
  lock(): void { void this.auth.lockApp(); }
}
