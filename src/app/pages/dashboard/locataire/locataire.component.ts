import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { ToastComponent } from '../../../shared/toast/toast.component';
import { AuthService } from '../../../services/auth.service';
import { SousCompteurService } from '../../../services/sous-compteur.service';
import { AlerteService } from '../../../services/alerte.service';
import { FacturationService } from '../../../services/facturation.service';
import { ToastService } from '../../../services/toast.service';
import { SousCompteurResponse } from '../../../models/sous-compteur.model';
import { AlerteResponse } from '../../../models/alerte.model';
import { catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CompteurService } from '../../../services/compteur.service';
import { STORAGE_KEYS } from '../../../config/app.config.api';

@Component({
  selector: 'app-locataire',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ToastComponent],
  templateUrl: './locataire.component.html',
  styleUrl: './locataire.component.scss'
})
export class LocataireComponent implements OnInit {
  private authService          = inject(AuthService);
  private compteurService      = inject(CompteurService);
  private sousCompteurService  = inject(SousCompteurService);
  private alerteService        = inject(AlerteService);
  private facturationService   = inject(FacturationService);
  private toast                = inject(ToastService);

  currentDate     = new Date();
  prenom          = signal(this.authService.getNomComplet()?.split(' ')[0] || 'Utilisateur');
  sousCompteur    = signal<SousCompteurResponse | null>(null);
  statsData       = signal<any>(null);
  derniereFacture = signal<any>(null);
  alertes         = signal<AlerteResponse[]>([]);
  chartData       = signal<{ label: string; value: number }[]>([]);
  isLoading       = signal(true);

  maxChartValue = computed(() => Math.max(1, ...this.chartData().map(d => d.value)));

  ngOnInit(): void {
    this.loadSousCompteur();
    this.loadAlertes();
    this.loadDerniereFacture();
  }

  loadSousCompteur(): void {
    this.isLoading.set(true);
    const userId = this.authService.getUserId();

    // Stratégie 1 : ID mis en cache — si l'appel échoue, on vide le cache
    //   et on enchaîne sur les stratégies suivantes (évite de rester bloqué sur un ID périmé).
    const cachedId = this.authService.getSousCompteurId();
    if (cachedId) {
      this.sousCompteurService.getSousCompteur(cachedId).pipe(
        catchError(() => {
          localStorage.removeItem(STORAGE_KEYS.sousCompteurId);
          return of(null);
        })
      ).subscribe(sc => {
        if (sc) { this.sousCompteur.set(sc); this.isLoading.set(false); return; }
        this.discoverSousCompteur(userId);
      });
      return;
    }

    this.discoverSousCompteur(userId);
  }

  private discoverSousCompteur(userId: number | null): void {
    // Stratégie 2 : /auth/me peut inclure sousCompteurId pour les LOCATAIRES
    this.authService.getMe().pipe(
      catchError(() => of(null)),
      switchMap((profile: any) => {
        if (profile?.sousCompteurId) {
          localStorage.setItem(STORAGE_KEYS.sousCompteurId, String(profile.sousCompteurId));
          return this.sousCompteurService.getSousCompteur(profile.sousCompteurId)
            .pipe(catchError(() => of(null)));
        }
        // Stratégie 3 : GET /api/compteurs peut renvoyer l'additionneuse comme pseudo-compteur
        return this.compteurService.getMesCompteurs().pipe(
          catchError(() => of([])),
          switchMap((compteurs: any[]) => {
            if (compteurs.length > 0 && compteurs[0]?.id) {
              return this.sousCompteurService.getSousCompteur(compteurs[0].id)
                .pipe(catchError(() => of(null)));
            }
            // Stratégie 4 : listing global filtré côté client (SOFT_URL)
            return this.sousCompteurService.getMesSousCompteurs().pipe(
              catchError(() => of([])),
              switchMap((liste: any[]) => {
                const match = liste.find((s: any) => s.locataireId === userId) ?? (liste.length === 1 ? liste[0] : null);
                if (match?.id) {
                  return this.sousCompteurService.getSousCompteur(match.id)
                    .pipe(catchError(() => of(null)));
                }
                // Stratégie 5 : endpoint dédié locataire (SOFT_URL)
                if (!userId) return of(null);
                return this.sousCompteurService.getMonSousCompteur(userId)
                  .pipe(catchError(() => of(null)));
              })
            );
          })
        );
      })
    ).subscribe(sc => {
      if (sc?.id) {
        localStorage.setItem(STORAGE_KEYS.sousCompteurId, String(sc.id));
      }
      this.sousCompteur.set(sc);
      this.isLoading.set(false);
    });
  }

  loadAlertes(): void {
    this.alerteService.getAlertes().subscribe({
      next: (a) => { if (Array.isArray(a)) this.alertes.set(a.slice(0, 3)); },
      error: () => {}
    });
  }

  loadDerniereFacture(): void {
    this.facturationService.getMesFactures().subscribe({
      next: (f) => { if (f?.length > 0) this.derniereFacture.set(f[0]); },
      error: () => {}
    });
  }

  getMoisLabel(mois?: number): string {
    if (!mois) return '—';
    const noms = ['Janvier','Février','Mars','Avril','Mai','Juin',
                  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    return mois >= 1 && mois <= 12 ? noms[mois - 1] : '—';
  }

  getTempsDepuis(dateStr?: string | null): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffMin < 1)  return 'à l\'instant';
    if (diffMin < 60) return `il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24)   return `il y a ${diffH}h`;
    return `il y a ${Math.floor(diffH / 24)}j`;
  }

  telechargerPdfFacture(factureId: number): void {
    this.facturationService.telechargerFacture(factureId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = `Facture_${factureId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toast.error('Erreur lors du téléchargement')
    });
  }
}
