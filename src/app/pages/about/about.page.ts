import { Component } from '@angular/core';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { keyOutline, lockClosedOutline, shieldCheckmarkOutline, timeOutline } from 'ionicons/icons';

@Component({ selector: 'app-about', standalone: true, imports: [IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar], templateUrl: './about.page.html', styleUrl: './about.page.scss' })
export class AboutPage { constructor() { addIcons({ keyOutline, lockClosedOutline, shieldCheckmarkOutline, timeOutline }); } }
