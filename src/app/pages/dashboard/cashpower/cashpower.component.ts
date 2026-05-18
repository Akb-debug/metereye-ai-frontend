import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/header/header.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ToastComponent } from '../../../shared/toast/toast.component';

import { CompteurService } from '../../../services/compteur.service';
import { ReadingService }   from '../../../services/reading.service';
import { AlerteService }    from '../../../services/alerte.service';
import { AuthService }      from '../../../services/auth.service';
import { ToastService }     from '../../../services/toast.service';

import { CompteurResponse, StatutConfig, StatsResponse } from '../../../models/compteur.model';
import { ReadingResponse }  from '../../../models/reading.model';
import { AlerteResponse }   from '../../../models/alerte.model';

interface ChartDay {
  label:     string;
  value:     number;
  heightPct: number;
  isToday:   boolean;
  isMax:     boolean;
}

@Component({
  selector: 'app-cashpower',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SidebarComponent, HeaderComponent, LoadingSpinnerComponent, ToastComponent],
  templateUrl: './cashpower.component.html',
  styleUrl: './cashpower.component.scss'
})
export class CashpowerComponent implements OnInit, OnDestroy {

  private compteurService = inject(CompteurService);
  private readingService  = inject(ReadingService);
  private alerteService   = inject(AlerteService);
  private authService     = inject(AuthService);
  private toast           = inject(ToastService);
  private fb              = inject(FormBuilder);

  compteur?:       CompteurResponse;
  statut?:         StatutConfig;
  stats?:          StatsResponse;
  dernierReleve?:  ReadingResponse;
  derniersReleves: ReadingResponse[] = [];
  alertesRecentes: AlerteResponse[]  = [];

  chartDays:       ChartDay[] = [];
  chartMoyenne    = 0;
  totalPeriode    = 0;
  dateRangeSemaine = '';
  periodeStats    = 'week';

  isLoading    = true;
  showModal    = false;
  isSaving     = false;
  errorMessage = '';
  releveForm!:  FormGroup;

  private polling?: Subscription;

  /* ── Computed ─────────────────────────────────── */

  get prenom(): string {
    return this.authService.getNomComplet().split(' ')[0];
  }

  get salutation(): string {
    return new Date().getHours() >= 18 ? 'Bonsoir' : 'Bonjour';
  }

  get dateAujourdhui(): string {
    const now = new Date();
    const j   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    const m   = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    return `${j[now.getDay()]} ${now.getDate()} ${m[now.getMonth()]} ${now.getFullYear()}`;
  }

  get creditDisplay(): number {
    return this.stats?.creditRestant ?? this.compteur?.valeurActuelle ?? 0;
  }

  get indexInitial(): number {
    return this.compteur?.indexInitial ?? 0;
  }

  get creditPct(): number {
    const current = this.creditDisplay;
    const initial = this.compteur?.indexInitial || 1000;
    return Math.min(100, Math.max(0, (current / initial) * 100));
  }

  get creditCouleur(): 'success' | 'warning' | 'danger' {
    if (this.creditPct > 50) return 'success';
    if (this.creditPct > 20) return 'warning';
    return 'danger';
  }

  get joursEstimes(): number {
    if (this.stats?.dateEstimationEpuisement) {
      const diff = new Date(this.stats.dateEstimationEpuisement).getTime() - Date.now();
      return Math.max(0, Math.floor(diff / 86_400_000));
    }
    const moy    = this.stats?.consommationMoyenneJour ?? 0;
    const credit = this.creditDisplay;
    return (credit && moy) ? Math.floor(credit / moy) : 0;
  }

  get moyenneJour(): number {
    return this.stats?.consommationMoyenneJour ?? 0;
  }

  get consommationJour(): number {
    return this.stats?.consommationJour ?? 0;
  }

  get consommationMois(): number {
    return this.stats?.consommationMois ?? 0;
  }

  get consommationSemaine(): number {
    return this.stats?.consommationSemaine ?? 0;
  }

  get tendanceJour(): number {
    const moy = this.moyenneJour;
    if (!moy) return 0;
    return Math.round(((this.consommationJour - moy) / moy) * 100);
  }

  get estManuel(): boolean {
    return this.statut?.modeLectureConfigure === 'MANUAL';
  }

  get sourceLecture(): string {
    switch (this.statut?.modeLectureConfigure ?? '') {
      case 'ESP32_CAM': return 'ESP32-CAM';
      case 'SENSOR':    return 'PZEM-004T';
      case 'MANUAL':    return 'Manuel';
      default:          return 'Auto';
    }
  }

  get modeAutoLabel(): string {
    const m = this.statut?.modeLectureConfigure ?? '';
    return m === 'MANUAL' ? 'manuel' : 'auto';
  }

  private readingDate(r: ReadingResponse): string {
    return r.date || r.dateTime || '';
  }

  get derniereLectureTemps(): string {
    const dateStr = this.readingDate(this.dernierReleve!);
    if (!dateStr || !this.dernierReleve) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000);
    if (diff < 1)  return 'à l\'instant';
    if (diff < 60) return `il y a ${diff} min`;
    const h = Math.floor(diff / 60);
    return h < 24 ? `il y a ${h}h` : `il y a ${Math.floor(h / 24)}j`;
  }

  get avgLinePx(): number {
    const max = Math.max(...this.chartDays.map(d => d.value), 0.1);
    return 28 + Math.round((this.chartMoyenne / max) * 160);
  }

  get rf() { return this.releveForm.controls; }

  /* ── Lifecycle ─────────────────────────────────── */

  ngOnInit(): void {
    this.releveForm = this.fb.group({ value: ['', [Validators.required, Validators.min(0)]] });
    this.chargerTout();
    this.polling = interval(30_000).subscribe(() => this.chargerCompteur());
  }

  ngOnDestroy(): void {
    this.polling?.unsubscribe();
  }

  /* ── Data loading ──────────────────────────────── */

  private chargerTout(): void {
    const id = this.compteurService.getCompteurIdSauvegarde();
    if (!id) { this.isLoading = false; return; }
    this.isLoading = true;
    this.compteurService.getCompteur(id).subscribe({
      next: (c) => {
        this.compteur  = c;
        this.isLoading = false;
        this.chargerStats(id);
        this.chargerStatut(id);
        this.chargerDernierReleve(id);
        this.chargerReleves(id);
        this.chargerAlertes();
        this.buildDateRange(this.periodeStats);
      },
      error: () => { this.isLoading = false; }
    });
  }

  private chargerCompteur(): void {
    const id = this.compteurService.getCompteurIdSauvegarde();
    if (!id) return;
    this.compteurService.getCompteur(id).subscribe({ next: (c) => { this.compteur = c; }, error: () => {} });
  }

  private chargerStats(id: number, periode = 'week'): void {
    this.compteurService.getStats(id, periode).subscribe({
      next: (s) => {
        this.stats        = s;
        this.chartMoyenne = s.consommationMoyenneJour;
        this.totalPeriode = periode === 'month' ? s.consommationMois : s.consommationSemaine;
        const hasParJour  = Object.keys(s.consommationParJour ?? {}).length > 0;
        if (hasParJour) {
          this.buildChartFromParJour(s.consommationParJour);
        } else {
          this.chargerRelevesPourChart(id);
        }
      },
      error: () => { this.chargerRelevesPourChart(id); }
    });
  }

  private chargerStatut(id: number): void {
    this.compteurService.getStatutConfig(id).subscribe({ next: (s) => { this.statut = s; }, error: () => {} });
  }

  private chargerDernierReleve(id: number): void {
    this.readingService.getDernierReleve(id).subscribe({ next: (r) => { this.dernierReleve = r; }, error: () => {} });
  }

  private chargerReleves(id: number): void {
    this.readingService.getReleves(id, 0, 5).subscribe({
      next: (p) => { this.derniersReleves = p.content.slice(0, 5); },
      error: () => {}
    });
  }

  private chargerRelevesPourChart(id: number): void {
    const nbJours = this.periodeStats === 'month' ? 30 : 7;
    const size    = nbJours === 30 ? 300 : 80;
    this.readingService.getReleves(id, 0, size).subscribe({
      next: (p) => { this.buildChartFromReleves(p.content, nbJours); },
      error: () => {}
    });
  }

  private chargerAlertes(): void {
    this.alerteService.getAlertesNonLues().subscribe({ next: (a) => { this.alertesRecentes = a.slice(0, 3); }, error: () => {} });
  }

  private buildChartFromReleves(releves: ReadingResponse[], nbJours: number): void {
    const JOURS   = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const today   = new Date();
    const todayStr = today.toDateString();

    const days = Array.from({ length: nbJours }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (nbJours - 1 - i));
      return {
        dateStr: d.toDateString(),
        label:   nbJours <= 7 ? JOURS[d.getDay()] : String(d.getDate()),
        isToday: d.toDateString() === todayStr,
        value:   0
      };
    });

    releves.forEach(r => {
      const dateStr = this.readingDate(r);
      if (r.consumption != null && r.consumption > 0 && dateStr) {
        const key = new Date(dateStr).toDateString();
        const day = days.find(x => x.dateStr === key);
        if (day) day.value = Math.round((day.value + r.consumption) * 10) / 10;
      }
    });

    const maxVal = Math.max(...days.map(d => d.value), 0.1);

    this.chartDays = days.map(d => ({
      label:     d.label,
      value:     d.value,
      heightPct: (d.value / maxVal) * 100,
      isToday:   d.isToday,
      isMax:     d.value === maxVal && d.value > 0 && !d.isToday
    }));

    if (this.chartMoyenne === 0 && days.length > 0) {
      const total = days.reduce((s, d) => s + d.value, 0);
      this.chartMoyenne = Math.round((total / nbJours) * 10) / 10;
      if (this.totalPeriode === 0) this.totalPeriode = Math.round(total * 10) / 10;
    }
  }

  private buildChartFromParJour(parJour: Record<string, number>): void {
    const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const todayKey = new Date().toISOString().slice(0, 10);

    const sorted = Object.entries(parJour)
      .map(([d, v]) => ({ dateKey: d.slice(0, 10), value: v }))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    if (sorted.length === 0) { this.chartDays = []; return; }

    const maxVal = Math.max(...sorted.map(e => e.value), 0.1);

    this.chartDays = sorted.map(e => {
      const d = new Date(e.dateKey + 'T12:00:00');
      return {
        label:     JOURS[d.getDay()],
        value:     e.value,
        heightPct: (e.value / maxVal) * 100,
        isToday:   e.dateKey === todayKey,
        isMax:     e.value === maxVal && e.value > 0 && e.dateKey !== todayKey
      };
    });
  }

  private buildDateRange(periode = 'week'): void {
    const now    = new Date();
    const nbDays = periode === 'month' ? 29 : 6;
    const start  = new Date(now); start.setDate(now.getDate() - nbDays);
    const M      = ['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc'];
    this.dateRangeSemaine = `Du ${start.getDate()} ${M[start.getMonth()]} au ${now.getDate()} ${M[now.getMonth()]}`;
  }

  changerPeriode(p: string): void {
    this.periodeStats = p;
    this.buildDateRange(p);
    const id = this.compteurService.getCompteurIdSauvegarde();
    if (!id) return;
    this.chargerStats(id, p);
  }

  ouvrirModal(): void { this.showModal = true; this.errorMessage = ''; this.releveForm.reset(); }
  fermerModal(): void { this.showModal = false; }

  ajouterReleve(): void {
    if (this.releveForm.invalid) { this.releveForm.markAllAsTouched(); return; }
    const id = this.compteurService.getCompteurIdSauvegarde();
    if (!id) return;
    this.isSaving = true;
    this.readingService.createReleveManuel({ meterId: id, value: +this.releveForm.value.value }).subscribe({
      next: () => { this.toast.success('Relevé enregistré !'); this.fermerModal(); this.chargerTout(); this.isSaving = false; },
      error: (err) => { this.errorMessage = err.message; this.isSaving = false; }
    });
  }

  /* ── Helpers UI ────────────────────────────────── */

  alerteIconClass(type: string): string {
    switch (type) {
      case 'SEUIL_CREDIT': case 'COUPURE_IMMINENTE':     return 'warning';
      case 'APPAREIL_RECONNECTE': case 'NOUVEAU_RELEVE': return 'success';
      default: return 'info';
    }
  }

  alerteLabelCourt(type: string): string {
    const m: Record<string, string> = {
      SEUIL_CREDIT: 'CREDIT FAIBLE', COUPURE_IMMINENTE: 'COUPURE',
      ANOMALIE_CONSOMMATION: 'ANOMALIE', APPAREIL_HORS_LIGNE: 'HORS LIGNE',
      APPAREIL_RECONNECTE: 'RECONNECTÉ', NOUVEAU_RELEVE: 'NOUVEAU RELEVÉ', RAPPORT_DISPONIBLE: 'RAPPORT'
    };
    return m[type] ?? type;
  }

  alerteTemps(date: string): string {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60_000);
    if (diff < 1)  return 'à l\'instant';
    if (diff < 60) return `il y a ${diff} min`;
    const h = Math.floor(diff / 60);
    return h < 24 ? `il y a ${h}h` : `il y a ${Math.floor(h / 24)}j`;
  }

  sourceBadge(source: string): string {
    switch (source) {
      case 'ESP32_CAM': return 'ESP32-CAM';
      case 'SENSOR':    return 'PZEM';
      case 'MANUAL':
      case 'MANUEL':    return 'Manuel';
      default:          return source;
    }
  }

  formatRelDate(r: ReadingResponse): string {
    const dateStr = this.readingDate(r);
    if (!dateStr) return '—';
    const d  = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const M  = ['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc'];
    const h  = d.getHours().toString().padStart(2, '0');
    const mn = d.getMinutes().toString().padStart(2, '0');
    return `${d.getDate()} ${M[d.getMonth()]} · ${h}:${mn}`;
  }
}
