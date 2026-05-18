import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { SidebarComponent }        from '../../../shared/sidebar/sidebar.component';
import { HeaderComponent }         from '../../../shared/header/header.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ToastComponent }          from '../../../shared/toast/toast.component';

import { CompteurService } from '../../../services/compteur.service';
import { ReadingService }  from '../../../services/reading.service';
import { AlerteService }   from '../../../services/alerte.service';
import { AuthService }     from '../../../services/auth.service';
import { ToastService }    from '../../../services/toast.service';

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
  selector: 'app-classique',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    SidebarComponent, HeaderComponent,
    LoadingSpinnerComponent, ToastComponent
  ],
  templateUrl: './classique.component.html',
  styleUrl: './classique.component.scss'
})
export class ClassiqueComponent implements OnInit, OnDestroy {

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

  chartDays:    ChartDay[] = [];
  chartMoyenne = 0;
  totalPeriode = 0;
  dateRange    = '';
  periodeStats = 'week';

  isLoading    = true;
  showModal    = false;
  isSaving     = false;
  errorMessage = '';

  releveForm!: FormGroup;

  private polling?: Subscription;

  readonly TARIF_FCFA = 148;

  /* ── Computed ──────────────────────────────────────────── */

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

  get indexActuel(): number   { return this.compteur?.valeurActuelle ?? 0; }
  get indexPrecedent(): number {
    return this.derniersReleves[1]?.value ?? this.compteur?.indexPrecedent ?? 0;
  }
  get consoJour(): number     { return this.stats?.consommationJour         ?? 0; }
  get consoMois(): number     { return this.stats?.consommationMois         ?? 0; }
  get moyenneJour(): number   { return this.stats?.consommationMoyenneJour  ?? 0; }
  get estimationFcfa(): number { return Math.round(this.consoMois * this.TARIF_FCFA); }

  get tendanceJour(): number {
    const moy = this.moyenneJour;
    if (!moy) return 0;
    return Math.round(((this.consoJour - moy) / moy) * 100);
  }

  get tendanceMois(): number {
    const expected = this.moyenneJour * 30;
    if (!expected) return 0;
    return Math.round(((this.consoMois - expected) / expected) * 100);
  }

  get estManuel(): boolean {
    const m = this.statut?.modeLectureConfigure ?? '';
    return m === 'MANUAL' || m === 'MANUEL';
  }

  get sourceLectureLabel(): string {
    switch (this.statut?.modeLectureConfigure) {
      case 'ESP32_CAM': return 'ESP32-CAM';
      case 'SENSOR':    return 'Capteur PZEM';
      default:          return 'Saisie manuelle';
    }
  }

  get avgLinePx(): number {
    const max = Math.max(...this.chartDays.map(d => d.value), 0.1);
    return 28 + Math.round((this.chartMoyenne / max) * 160);
  }

  get rf() { return this.releveForm.controls; }

  private readingDate(r: ReadingResponse): string {
    return r.date || r.dateTime || '';
  }

  /* ── Lifecycle ─────────────────────────────────────────── */

  ngOnInit(): void {
    this.releveForm = this.fb.group({
      value: ['', [Validators.required, Validators.min(0)]]
    });
    this.chargerTout();
    this.polling = interval(30_000).subscribe(() => this.chargerCompteur());
  }

  ngOnDestroy(): void { this.polling?.unsubscribe(); }

  /* ── Data loading ──────────────────────────────────────── */

  private chargerTout(): void {
    const id = this.compteurService.getCompteurIdSauvegarde();
    if (!id) { this.isLoading = false; return; }
    this.isLoading = true;

    this.compteurService.getCompteur(id).subscribe({
      next: (c) => {
        this.compteur  = c;
        this.isLoading = false;
        this.chargerStatut(id);
        this.chargerStats(id, this.periodeStats);
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

  private chargerStatut(id: number): void {
    this.compteurService.getStatutConfig(id).subscribe({ next: (s) => { this.statut = s; }, error: () => {} });
  }

  private chargerStats(id: number, periode: string): void {
    const apiPeriode = periode === 'day' ? 'week' : periode;
    this.compteurService.getStats(id, apiPeriode).subscribe({
      next: (s) => {
        this.stats        = s;
        this.chartMoyenne = s.consommationMoyenneJour;
        this.totalPeriode = periode === 'month' ? s.consommationMois : s.consommationSemaine;

        const entries     = Object.entries(s.consommationParJour ?? {});
        const hasParJour  = entries.length > 0;
        if (hasParJour) {
          const nbJours = periode === 'month' ? 30 : periode === 'day' ? 1 : 7;
          const sliced  = entries.sort(([a], [b]) => a.localeCompare(b)).slice(-nbJours);
          this.buildChartFromParJour(Object.fromEntries(sliced));
        } else {
          this.chargerRelevesPourChart(id, periode);
        }
      },
      error: () => { this.chargerRelevesPourChart(id, periode); }
    });
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

  private chargerRelevesPourChart(id: number, periode: string): void {
    const nbJours = periode === 'month' ? 30 : periode === 'day' ? 1 : 7;
    this.readingService.getReleves(id, 0, nbJours >= 30 ? 300 : 80).subscribe({
      next: (p) => { this.buildChartFromReleves(p.content, nbJours); },
      error: () => {}
    });
  }

  private chargerAlertes(): void {
    this.alerteService.getAlertesNonLues().subscribe({
      next: (a) => { this.alertesRecentes = a.slice(0, 3); },
      error: () => {}
    });
  }

  private buildChartFromParJour(parJour: Record<string, number>): void {
    const JOURS    = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const todayKey = new Date().toISOString().slice(0, 10);
    const sorted   = Object.entries(parJour)
      .map(([d, v]) => ({ dateKey: d.slice(0, 10), value: v }))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    if (!sorted.length) { this.chartDays = []; return; }
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

  private buildChartFromReleves(releves: ReadingResponse[], nbJours: number): void {
    const JOURS    = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const today    = new Date();
    const todayStr = today.toDateString();

    const days = Array.from({ length: nbJours }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (nbJours - 1 - i));
      return { dateStr: d.toDateString(), label: nbJours <= 7 ? JOURS[d.getDay()] : String(d.getDate()), isToday: d.toDateString() === todayStr, value: 0 };
    });

    releves.forEach(r => {
      const s = this.readingDate(r);
      if (r.consumption != null && r.consumption > 0 && s) {
        const day = days.find(x => x.dateStr === new Date(s).toDateString());
        if (day) day.value = Math.round((day.value + r.consumption) * 10) / 10;
      }
    });

    const maxVal = Math.max(...days.map(d => d.value), 0.1);
    this.chartDays = days.map(d => ({
      label: d.label, value: d.value,
      heightPct: (d.value / maxVal) * 100,
      isToday:   d.isToday,
      isMax:     d.value === maxVal && d.value > 0 && !d.isToday
    }));

    if (!this.chartMoyenne) {
      const total = days.reduce((s, d) => s + d.value, 0);
      this.chartMoyenne = Math.round((total / nbJours) * 10) / 10;
      if (!this.totalPeriode) this.totalPeriode = Math.round(total * 10) / 10;
    }
  }

  private buildDateRange(periode: string): void {
    const now    = new Date();
    const nbDays = periode === 'month' ? 29 : periode === 'day' ? 0 : 6;
    const start  = new Date(now); start.setDate(now.getDate() - nbDays);
    const M = ['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc'];
    this.dateRange = `Du ${start.getDate()} au ${now.getDate()} ${M[now.getMonth()]}`;
  }

  changerPeriode(p: string): void {
    this.periodeStats = p;
    this.buildDateRange(p);
    const id = this.compteurService.getCompteurIdSauvegarde();
    if (id) this.chargerStats(id, p);
  }

  /* ── Modal ─────────────────────────────────────────────── */

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

  /* ── UI helpers ─────────────────────────────────────────── */

  formatRelDate(r: ReadingResponse): string {
    const s = this.readingDate(r);
    if (!s) return '—';
    const d = new Date(s);
    if (isNaN(d.getTime())) return '—';
    const M = ['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc'];
    return `${d.getDate()} ${M[d.getMonth()]} · ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  }

  sourceBadgeClass(source: string): string {
    switch (source) {
      case 'MANUAL': case 'MANUEL': return 'src-manual';
      case 'ESP32_CAM':             return 'src-esp';
      case 'SENSOR':                return 'src-pzem';
      default:                      return 'src-other';
    }
  }

  sourceLabel(source: string): string {
    switch (source) {
      case 'MANUAL': case 'MANUEL': return 'Manuel';
      case 'ESP32_CAM':             return 'ESP32-CAM';
      case 'SENSOR':                return 'PZEM';
      default:                      return source;
    }
  }

  isValid(r: ReadingResponse): boolean {
    if (r.statut) return r.statut === 'VALID' || r.statut === 'VALIDE';
    return r.consumption == null || r.consumption !== 0;
  }

  alerteIconClass(type: string): string {
    switch (type) {
      case 'ANOMALIE_CONSOMMATION':               return 'ai-warning';
      case 'SEUIL_CREDIT': case 'COUPURE_IMMINENTE': return 'ai-danger';
      case 'NOUVEAU_RELEVE': case 'RAPPORT_DISPONIBLE': case 'APPAREIL_RECONNECTE': return 'ai-success';
      case 'APPAREIL_HORS_LIGNE':                 return 'ai-muted';
      default:                                    return 'ai-info';
    }
  }

  alerteLabelCourt(type: string): string {
    const m: Record<string, string> = {
      SEUIL_CREDIT: 'CRÉDIT FAIBLE', COUPURE_IMMINENTE: 'COUPURE',
      ANOMALIE_CONSOMMATION: 'CONSOMMATION_ANORMALE', APPAREIL_HORS_LIGNE: 'HORS LIGNE',
      APPAREIL_RECONNECTE: 'RECONNECTÉ', NOUVEAU_RELEVE: 'NOUVEAU_RELEVE', RAPPORT_DISPONIBLE: 'RAPPORT',
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

  tendanceLabel(pct: number): string {
    if (pct > 0) return `↑ +${Math.abs(pct)} % vs hier`;
    if (pct < 0) return `↓ -${Math.abs(pct)} % vs hier`;
    return '→ stable';
  }

  tendanceClass(pct: number): string {
    if (pct > 0) return 'trend-up';
    if (pct < 0) return 'trend-down';
    return 'trend-neutral';
  }
}
