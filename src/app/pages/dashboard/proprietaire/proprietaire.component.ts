import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { ToastComponent } from '../../../shared/toast/toast.component';
import { AuthService } from '../../../services/auth.service';
import { MaisonService } from '../../../services/maison.service';
import { CompteurService } from '../../../services/compteur.service';
import { AlerteService } from '../../../services/alerte.service';
import { FacturationService } from '../../../services/facturation.service';
import { ReadingService } from '../../../services/reading.service';
import { ToastService } from '../../../services/toast.service';
import { MaisonResponse } from '../../../models/maison.model';
import { AlerteResponse } from '../../../models/alerte.model';
import { CompteurResponse } from '../../../models/compteur.model';
import { ReadingResponse } from '../../../models/reading.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-proprietaire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, ToastComponent],
  templateUrl: './proprietaire.component.html',
  styleUrl: './proprietaire.component.scss'
})
export class ProprietaireComponent implements OnInit {
  private authService        = inject(AuthService);
  private maisonService      = inject(MaisonService);
  private compteurService    = inject(CompteurService);
  private alerteService      = inject(AlerteService);
  private facturationService = inject(FacturationService);
  private readingService     = inject(ReadingService);
  private toastService       = inject(ToastService);
  private fb                 = inject(FormBuilder);

  currentDate    = new Date();
  prenom         = signal<string>('');
  activeMaison   = signal<MaisonResponse | null>(null);
  compteur       = signal<CompteurResponse | null>(null);
  dernierReleve  = signal<ReadingResponse | null>(null);
  stats          = signal<any>(null);
  recentAlertes  = signal<AlerteResponse[]>([]);
  locatairesData = signal<any[]>([]);
  isLoading      = signal(true);
  chartData      = signal<{ label: string; value: number }[]>([]);

  // ── Computed ──────────────────────────────────

  isCashPower = computed(() =>
    this.activeMaison()?.typeCompteur === 'CASH_POWER'
  );

  heroLabel = computed(() =>
    this.isCashPower() ? 'CRÉDIT RESTANT' : 'INDEX ACTUEL'
  );

  heroValeur = computed(() => {
    if (this.isCashPower()) {
      return this.stats()?.creditRestant ?? this.compteur()?.valeurActuelle ?? 0;
    }
    return this.compteur()?.valeurActuelle ?? 0;
  });

  // % de crédit restant (CASH_POWER) = crédit / (crédit + conso mois)
  progressPct = computed(() => {
    if (!this.isCashPower()) return 0;
    const credit = this.stats()?.creditRestant ?? 0;
    const conso  = this.stats()?.consommationMois ?? 0;
    const total  = credit + conso;
    return total > 0 ? Math.min(100, Math.round((credit / total) * 100)) : 0;
  });

  maxChartValue = computed(() =>
    Math.max(1, ...this.chartData().map(d => d.value))
  );

  chartSubtitle = computed(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    const M = ['jan','fév','mars','avr','mai','juin','juil','août','sept','oct','nov','déc'];
    return `Du ${start.getDate()} ${M[start.getMonth()]} au ${today.getDate()} ${M[today.getMonth()]}`;
  });

  // ── Modal relevé ──────────────────────────────
  showModalReleve = signal(false);
  isSavingReleve  = signal(false);
  relErreur       = signal('');
  releveForm!:    FormGroup;

  ngOnInit(): void {
    this.prenom.set(this.authService.getNomComplet()?.split(' ')[0] || 'Utilisateur');
    this.releveForm = this.fb.group({
      value:   ['', [Validators.required, Validators.min(0)]],
      comment: ['']
    });
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading.set(true);
    this.maisonService.getMaisons().subscribe({
      next: (maisons) => {
        if (maisons.length > 0) {
          const maison = maisons[0];
          this.activeMaison.set(maison);

          const requests: any = { alertes: this.alerteService.getAlertes() };

          if (maison.compteurPrincipalId) {
            const id = maison.compteurPrincipalId;
            requests.stats         = this.compteurService.getStats(id, 'month');
            requests.compteur      = this.compteurService.getCompteur(id);
            requests.dernierReleve = this.readingService.getDernierReleve(id)
              .pipe(catchError(() => of(null)));
          }

          this.facturationService
            .getFacturesMaison(maison.id, new Date().getMonth() + 1, new Date().getFullYear())
            .subscribe({
              next: (factRes) => this.locatairesData.set(factRes.items || []),
              error: () => {}
            });

          forkJoin(requests).subscribe({
            next: (res: any) => {
              this.recentAlertes.set(res.alertes?.slice(0, 3) ?? []);
              if (res.stats)        { this.stats.set(res.stats); this.processChartData(res.stats.consommationParJour); }
              if (res.compteur)       this.compteur.set(res.compteur);
              if (res.dernierReleve)  this.dernierReleve.set(res.dernierReleve);
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

  processChartData(data: { [key: string]: number }): void {
    if (!data) return;
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    this.chartData.set(
      days.map(day => ({
        label: day,
        value: data[day] || Object.values(data)[days.indexOf(day)] || 0
      }))
    );
  }

  // ── Modal relevé ──────────────────────────────

  ouvrirModalReleve(): void {
    this.showModalReleve.set(true);
    this.relErreur.set('');
    this.releveForm.reset();
  }

  fermerModalReleve(): void {
    this.showModalReleve.set(false);
  }

  ajouterReleve(): void {
    if (this.releveForm.invalid) { this.releveForm.markAllAsTouched(); return; }
    const id = this.activeMaison()?.compteurPrincipalId;
    if (!id) { this.relErreur.set('Aucun compteur associé à cette maison.'); return; }

    this.isSavingReleve.set(true);
    this.readingService.createReleveManuel({
      meterId: id,
      value:   +this.releveForm.value.value,
      comment: this.releveForm.value.comment || undefined
    }).subscribe({
      next: () => {
        this.toastService.success('Relevé ajouté avec succès !');
        this.fermerModalReleve();
        this.loadAllData();
        this.isSavingReleve.set(false);
      },
      error: (e) => {
        this.relErreur.set(e?.error?.message ?? 'Une erreur est survenue.');
        this.isSavingReleve.set(false);
      }
    });
  }

  // ── Helpers ───────────────────────────────────

  getModeLabel(mode?: string | null): string {
    switch (mode) {
      case 'MANUAL':    return 'Manuel';
      case 'ESP32_CAM': return 'ESP32-CAM';
      case 'SENSOR':    return 'PZEM-004T';
      default:          return 'Manuel';
    }
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

  getAlertClass(type: string): string {
    switch (type) {
      case 'DANGER':  return 'alert-danger';
      case 'WARNING': return 'alert-warning';
      default:        return 'alert-success';
    }
  }
}
