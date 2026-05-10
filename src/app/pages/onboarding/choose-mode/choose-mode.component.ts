// ✅ CRÉÉ — choose-mode.component.ts

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CompteurService } from '../../../services/compteur.service';
import { ToastService } from '../../../services/toast.service';
import { ToastComponent } from '../../../shared/toast/toast.component';
import { ModeLecture } from '../../../models/compteur.model';
import { STORAGE_KEYS } from '../../../config/app.config.api';

@Component({
  selector: 'app-choose-mode',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  templateUrl: './choose-mode.component.html',
  styleUrl: './choose-mode.component.scss'
})
export class ChooseModeComponent {

  private compteurService = inject(CompteurService);
  private router          = inject(Router);
  private toast           = inject(ToastService);

  isLoading         = false;
  errorMessage      = '';
  modeSelectionne: ModeLecture = 'MANUAL';

  modes = [
    {
      value: 'MANUAL' as ModeLecture,
      label: 'Saisie manuelle',
      desc: 'Entrez vous-même la valeur de votre compteur quand vous le souhaitez.',
      icon: 'pencil',
      badge: 'Simple'
    },
    {
      value: 'ESP32_CAM' as ModeLecture,
      label: 'ESP32-CAM',
      desc: 'Un module caméra photographie votre compteur automatiquement. Relevés sans intervention.',
      icon: 'camera',
      badge: 'Automatique'
    },
    {
      value: 'SENSOR' as ModeLecture,
      label: 'Capteur PZEM-004T',
      desc: 'Capteur de mesure directe branché sur votre installation. Données en temps réel.',
      icon: 'chip',
      badge: 'Temps réel'
    }
  ];

  selectMode(mode: ModeLecture): void {
    this.modeSelectionne = mode;
  }

  confirmer(): void {
    const compteurId = this.compteurService.getCompteurIdSauvegarde();
    if (!compteurId) {
      this.toast.error('Compteur introuvable. Veuillez recommencer.');
      this.router.navigate(['/onboarding/compteur']);
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    this.compteurService.setModeLecture(compteurId, this.modeSelectionne).subscribe({
      next: () => {
        this.toast.success('Mode de lecture configuré !');
        if (this.modeSelectionne === 'MANUAL') {
          this.redirectDashboard();
        } else if (this.modeSelectionne === 'ESP32_CAM') {
          this.router.navigate(['/onboarding/config-esp32']);
        } else {
          this.router.navigate(['/onboarding/config-pzem']);
        }
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }

  private redirectDashboard(): void {
    const type = localStorage.getItem(STORAGE_KEYS.typeCompteur);
    if (type === 'CASH_POWER') {
      this.router.navigate(['/dashboard/cashpower']);
    } else {
      this.router.navigate(['/dashboard/classique']);
    }
  }
}
