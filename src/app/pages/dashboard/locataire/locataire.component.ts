import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { AuthService } from '../../../services/auth.service';
import { CompteurService } from '../../../services/compteur.service';
import { AlerteService } from '../../../services/alerte.service';
import { CompteurResponse } from '../../../models/compteur.model';
import { AlerteResponse } from '../../../models/alerte.model';

@Component({
  selector: 'app-locataire',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './locataire.component.html',
  styleUrl: './locataire.component.scss'
})
export class LocataireComponent implements OnInit {
  private authService = inject(AuthService);
  private compteurService = inject(CompteurService);
  private alerteService = inject(AlerteService);

  prenom = signal(this.authService.getNomComplet()?.split(' ')[0] || 'Utilisateur');
  activeCompteur = signal<CompteurResponse | null>(null);
  isLoading = signal(true);
  chartData = signal<{label: string, value: number}[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    // Un locataire n'a généralement qu'un seul compteur associé (son sous-compteur)
    this.compteurService.getMesCompteurs().subscribe({
      next: (compteurs) => {
        if (compteurs.length > 0) {
          const main = compteurs[0];
          this.activeCompteur.set(main);
          this.loadStats(main.id);
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadStats(id: number): void {
    this.compteurService.getStats(id, 'month').subscribe({
      next: (stats) => {
        if (stats.consommationParJour) {
          this.processChartData(stats.consommationParJour);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  processChartData(data: {[key: string]: number}): void {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const mapped = days.map(day => ({
      label: day,
      value: data[day] || Object.values(data)[days.indexOf(day)] || 0
    }));
    this.chartData.set(mapped);
  }

  seDeconnecter(): void {
    this.authService.logout();
  }
}

