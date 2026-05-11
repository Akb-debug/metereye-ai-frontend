// ✅ CRÉÉ — alertes.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { ToastComponent } from '../../shared/toast/toast.component';

import { AlerteService } from '../../services/alerte.service';
import { NotificationService } from '../../services/notification.service';
import { ToastService } from '../../services/toast.service';

import { AlerteResponse, NotificationResponse } from '../../models/alerte.model';

@Component({
  selector: 'app-alertes',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent, HeaderComponent,
    LoadingSpinnerComponent, ToastComponent
  ],
  templateUrl: './alertes.component.html',
  styleUrl: './alertes.component.scss'
})
export class AlertesComponent implements OnInit {

  private alerteService = inject(AlerteService);
  private notifService  = inject(NotificationService);
  private toast         = inject(ToastService);

  alertes:       AlerteResponse[]       = [];
  notifications: NotificationResponse[] = [];

  isLoadingAlertes = true;
  isLoadingNotifs  = true;
  activeTab        = 'alertes';

  ngOnInit(): void {
    this.chargerAlertes();
    this.chargerNotifications();
  }

  chargerAlertes(): void {
    this.isLoadingAlertes = true;
    this.alerteService.getAlertes().subscribe({
      next: (a) => { this.alertes = a; this.isLoadingAlertes = false; },
      error: () => { this.isLoadingAlertes = false; }
    });
  }

  chargerNotifications(): void {
    this.isLoadingNotifs = true;
    this.notifService.getNotifications().subscribe({
      next: (n) => { this.notifications = n; this.isLoadingNotifs = false; },
      error: () => { this.isLoadingNotifs = false; }
    });
  }

  marquerLue(alerte: AlerteResponse): void {
    if (alerte.lue) return;
    this.alerteService.marquerLue(alerte.id).subscribe({
      next: () => {
        alerte.lue = true;
        this.toast.success('Alerte marquée comme lue.');
      },
      error: () => {}
    });
  }

  marquerToutLu(): void {
    this.alerteService.marquerToutLu().subscribe({
      next: () => {
        this.alertes.forEach(a => a.lue = true);
        this.toast.success('Toutes les alertes marquées comme lues.');
      },
      error: (err) => { this.toast.error(err.message); }
    });
  }

  get nbNonLues(): number {
    return this.alertes.filter(a => !a.lue).length;
  }

  alerteIcon(type: string): string {
    switch (type) {
      case 'SEUIL_CREDIT':           return 'danger';
      case 'COUPURE_IMMINENTE':      return 'danger';
      case 'ANOMALIE_CONSOMMATION':  return 'warning';
      case 'APPAREIL_HORS_LIGNE':    return 'warning';
      case 'APPAREIL_RECONNECTE':    return 'success';
      case 'NOUVEAU_RELEVE':         return 'info';
      case 'RAPPORT_DISPONIBLE':     return 'info';
      default:                       return 'info';
    }
  }

  alerteLabel(type: string): string {
    const map: Record<string, string> = {
      SEUIL_CREDIT:          'Crédit faible',
      COUPURE_IMMINENTE:     'Coupure imminente',
      ANOMALIE_CONSOMMATION: 'Anomalie',
      APPAREIL_HORS_LIGNE:   'Module hors ligne',
      APPAREIL_RECONNECTE:   'Module reconnecté',
      NOUVEAU_RELEVE:        'Nouveau relevé',
      RAPPORT_DISPONIBLE:    'Rapport disponible',
    };
    return map[type] ?? type;
  }
}
