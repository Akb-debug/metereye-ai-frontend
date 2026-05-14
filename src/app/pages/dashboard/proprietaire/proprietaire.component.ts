import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { AuthService } from '../../../services/auth.service';
import { MaisonService } from '../../../services/maison.service';
import { CompteurService } from '../../../services/compteur.service';
import { AlerteService } from '../../../services/alerte.service';
import { FacturationService } from '../../../services/facturation.service';
import { MaisonResponse } from '../../../models/maison.model';
import { AlerteResponse } from '../../../models/alerte.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-proprietaire',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './proprietaire.component.html',
  styleUrl: './proprietaire.component.scss'
})
export class ProprietaireComponent implements OnInit {
  private authService      = inject(AuthService);
  private maisonService    = inject(MaisonService);
  private compteurService  = inject(CompteurService);
  private alerteService    = inject(AlerteService);
  private facturationService = inject(FacturationService);

  currentDate = new Date();
  prenom = signal<string>('');
  activeMaison = signal<MaisonResponse | null>(null);
  stats = signal<any>(null);
  recentAlertes = signal<AlerteResponse[]>([]);
  locatairesData = signal<any[]>([]);
  isLoading = signal(true);

  // Chart data (mock logic for now if backend not ready, but structure is dynamic)
  chartData = signal<{label: string, value: number}[]>([]);

  ngOnInit(): void {
    this.prenom.set(this.authService.getNomComplet()?.split(' ')[0] || 'Utilisateur');
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading.set(true);
    this.maisonService.getMaisons().subscribe({
      next: (maisons) => {
        if (maisons.length > 0) {
          const maison = maisons[0];
          this.activeMaison.set(maison);
          
          const requests: any = {
            alertes: this.alerteService.getAlertes(),
          };

          if (maison.compteurPrincipalId) {
            requests.stats = this.compteurService.getStats(maison.compteurPrincipalId, 'month');
          }

          // On pourrait ajouter les factures ici aussi
          this.facturationService.getFacturesMaison(maison.id, new Date().getMonth() + 1, new Date().getFullYear()).subscribe({
            next: (factRes) => {
              this.locatairesData.set(factRes.items || []);
            },
            error: () => {}
          });

          forkJoin(requests).subscribe({
            next: (res: any) => {
              this.recentAlertes.set(res.alertes.slice(0, 3));
              if (res.stats) {
                this.stats.set(res.stats);
                this.processChartData(res.stats.consommationParJour);
              }
              this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
          });
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  processChartData(data: {[key: string]: number}): void {
    if (!data) return;
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'short' });
    
    // On extrait les valeurs pour les 7 derniers jours ou on mappe par jour de la semaine
    const mapped = days.map(day => {
      // Note: mapping simple pour la démo, en réel on utiliserait les clés ISO du backend
      const val = data[day] || Object.values(data)[days.indexOf(day)] || 0;
      return {
        label: day,
        value: val
      };
    });
    this.chartData.set(mapped);
  }

  getAlertClass(type: string): string {
    switch(type) {
      case 'DANGER': return 'alert-danger';
      case 'WARNING': return 'alert-warning';
      default: return 'alert-success';
    }
  }

  getAlertIcon(type: string): string {
    // Retourne le code SVG ou une classe d'icône
    return '';
  }
}
