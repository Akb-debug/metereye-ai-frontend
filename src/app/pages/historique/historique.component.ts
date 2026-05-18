import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SidebarComponent }       from '../../shared/sidebar/sidebar.component';
import { ToastComponent }         from '../../shared/toast/toast.component';
import { ToastService }           from '../../services/toast.service';

import { ReadingService }   from '../../services/reading.service';
import { CompteurService }  from '../../services/compteur.service';
import { CompteurResponse } from '../../models/compteur.model';
import { ReadingResponse }  from '../../models/reading.model';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, ToastComponent],
  templateUrl: './historique.component.html',
  styleUrl: './historique.component.scss'
})
export class HistoriqueComponent implements OnInit {

  private readingService  = inject(ReadingService);
  private compteurService = inject(CompteurService);
  private toast           = inject(ToastService);
  private fb              = inject(FormBuilder);

  compteur?:       CompteurResponse;
  allReleves:      ReadingResponse[] = [];
  filteredReleves: ReadingResponse[] = [];
  displayReleves:  ReadingResponse[] = [];

  isLoading    = true;
  showModal    = false;
  isSaving     = false;
  errorMessage = '';
  currentPage  = 0;
  readonly pageSize = 10;

  filterForm!: FormGroup;
  ajoutForm!:  FormGroup;

  sourceOptions = [
    { value: '',          label: 'Tous' },
    { value: 'MANUEL',    label: 'Manuel' },
    { value: 'ESP32_CAM', label: 'ESP32-CAM' },
    { value: 'SENSOR',    label: 'Capteur PZEM' }
  ];

  statutOptions = [
    { value: '',        label: 'Tous' },
    { value: 'VALID',   label: 'Valide' },
    { value: 'INVALID', label: 'Invalide' }
  ];

  /* ── Computed ─────────────────────────────────────────── */

  get totalFiltres(): number { return this.filteredReleves.length; }
  get totalPages():   number { return Math.max(1, Math.ceil(this.totalFiltres / this.pageSize)); }
  get debut():        number { return this.totalFiltres === 0 ? 0 : this.currentPage * this.pageSize + 1; }
  get fin():          number { return Math.min((this.currentPage + 1) * this.pageSize, this.totalFiltres); }

  get subtitleText(): string {
    const type = this.compteur?.typeCompteur === 'CASH_POWER' ? 'Cash Power' : 'Classique';
    const ref  = this.compteur?.reference ?? '';
    const suffix = `${this.totalFiltres} relevés au total`;
    return this.compteur ? `${ref} · ${type} · ${suffix}` : suffix;
  }

  get paginationItems(): (number | '...')[] {
    const total = this.totalPages;
    const cur   = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const items: (number | '...')[] = [0];
    if (cur > 3)         items.push('...');
    for (let i = Math.max(1, cur - 1); i <= Math.min(total - 2, cur + 1); i++) items.push(i);
    if (cur < total - 4) items.push('...');
    items.push(total - 1);
    return items;
  }

  get rf() { return this.ajoutForm.controls; }

  /* ── Lifecycle ─────────────────────────────────────────── */

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      dateDebut: [''],
      dateFin:   [''],
      source:    [''],
      statut:    ['']
    });
    this.ajoutForm = this.fb.group({
      value:   ['', [Validators.required, Validators.min(0)]],
      comment: ['']
    });
    this.charger();
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 0;
      this.appliquerFiltres();
    });
  }

  /* ── Data ──────────────────────────────────────────────── */

  charger(): void {
    const id = this.compteurService.getCompteurIdSauvegarde();
    if (!id) { this.isLoading = false; return; }
    this.isLoading = true;

    this.compteurService.getCompteur(id).subscribe({
      next: (c) => { this.compteur = c; },
      error: () => {}
    });

    this.readingService.getReleves(id, 0, 1000).subscribe({
      next: (p) => {
        this.allReleves = p.content;
        this.isLoading  = false;
        this.appliquerFiltres();
      },
      error: () => { this.isLoading = false; }
    });
  }

  appliquerFiltres(): void {
    const { dateDebut, dateFin, source, statut } = this.filterForm.value;
    let result = [...this.allReleves];

    if (dateDebut) {
      const from = new Date(dateDebut); from.setHours(0, 0, 0, 0);
      result = result.filter(r => { const d = new Date(this.getDate(r)); return !isNaN(d.getTime()) && d >= from; });
    }
    if (dateFin) {
      const to = new Date(dateFin); to.setHours(23, 59, 59, 999);
      result = result.filter(r => { const d = new Date(this.getDate(r)); return !isNaN(d.getTime()) && d <= to; });
    }
    if (source)            result = result.filter(r => r.source === source || (source === 'MANUEL' && r.source === 'MANUAL'));
    if (statut === 'VALID')   result = result.filter(r =>  this.isValid(r));
    if (statut === 'INVALID') result = result.filter(r =>  !this.isValid(r));

    this.filteredReleves = result;
    this.updatePage();
  }

  private updatePage(): void {
    const s = this.currentPage * this.pageSize;
    this.displayReleves = this.filteredReleves.slice(s, s + this.pageSize);
  }

  goPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
  }

  reinitialiser(): void {
    this.currentPage = 0;
    this.filterForm.reset({ dateDebut: '', dateFin: '', source: '', statut: '' });
  }

  /* ── Modal ─────────────────────────────────────────────── */

  ouvrirModal(): void { this.showModal = true; this.errorMessage = ''; this.ajoutForm.reset(); }
  fermerModal(): void { this.showModal = false; }

  ajouterReleve(): void {
    if (this.ajoutForm.invalid) { this.ajoutForm.markAllAsTouched(); return; }
    const id = this.compteurService.getCompteurIdSauvegarde();
    if (!id) return;
    this.isSaving = true;
    this.readingService.createReleveManuel({
      meterId: id,
      value:   +this.ajoutForm.value.value,
      comment: this.ajoutForm.value.comment || undefined
    }).subscribe({
      next: () => { this.toast.success('Relevé ajouté !'); this.fermerModal(); this.charger(); this.isSaving = false; },
      error: (e) => { this.errorMessage = e?.error?.message ?? 'Une erreur est survenue.'; this.isSaving = false; }
    });
  }

  /* ── Export CSV ─────────────────────────────────────────── */

  exporterCSV(): void {
    const headers = ['#', 'Date & Heure', 'Valeur (kWh)', 'Consommation (kWh)', 'Source', 'Statut'];
    const rows = this.filteredReleves.map((r, i) => [
      this.totalFiltres - i,
      this.formatDate(r),
      r.value,
      r.consumption ?? '',
      this.sourceLabel(r.source),
      this.isValid(r) ? 'VALID' : 'INVALID'
    ]);
    const csv  = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `releves_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Helpers ────────────────────────────────────────────── */

  rowNumber(index: number): number {
    return this.totalFiltres - (this.currentPage * this.pageSize + index);
  }

  getDate(r: ReadingResponse): string {
    return r.date || r.dateTime || '';
  }

  formatDate(r: ReadingResponse): string {
    const s = this.getDate(r);
    if (!s) return '—';
    const d = new Date(s);
    if (isNaN(d.getTime())) return '—';
    const M  = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    const h  = d.getHours().toString().padStart(2, '0');
    const mn = d.getMinutes().toString().padStart(2, '0');
    return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()} · ${h}:${mn}`;
  }

  isValid(r: ReadingResponse): boolean {
    if (r.statut) return r.statut === 'VALID' || r.statut === 'VALIDE';
    if (r.consumption === null || r.consumption === undefined) return true;
    return r.consumption !== 0;
  }

  sourceBadgeClass(source: string): string {
    switch (source) {
      case 'MANUAL':
      case 'MANUEL':    return 'src-manual';
      case 'ESP32_CAM': return 'src-esp';
      case 'SENSOR':    return 'src-pzem';
      default:          return 'src-other';
    }
  }

  sourceLabel(source: string): string {
    switch (source) {
      case 'MANUAL':
      case 'MANUEL':    return 'Manuel';
      case 'ESP32_CAM': return 'ESP32-CAM';
      case 'SENSOR':    return 'Capteur PZEM';
      default:          return source;
    }
  }

  consoClass(r: ReadingResponse): string {
    if (r.consumption === null || r.consumption === undefined) return '';
    if (r.consumption > 0)  return 'conso-neg';
    if (r.consumption === 0) return 'conso-zero';
    return 'conso-pos';
  }
}
