// 🔄 MODIFIÉ — classique.component.ts — implémentation complète dashboard Classique

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { interval, Subscription } from 'rxjs';

import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/header/header.component';
import { BarChartComponent, BarChartData } from '../../../shared/bar-chart/bar-chart.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ToastComponent } from '../../../shared/toast/toast.component';

import { CompteurService } from '../../../services/compteur.service';
import { ReadingService } from '../../../services/reading.service';
import { ToastService } from '../../../services/toast.service';

import { CompteurResponse, StatutConfig } from '../../../models/compteur.model';
import { ReadingResponse } from '../../../models/reading.model';

@Component({
  selector: 'app-classique',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    SidebarComponent, HeaderComponent, BarChartComponent,
    LoadingSpinnerComponent, ToastComponent
  ],
  templateUrl: './classique.component.html',
  styleUrl: './classique.component.scss'
})
export class ClassiqueComponent implements OnInit, OnDestroy {

  private compteurService = inject(CompteurService);
  private readingService  = inject(ReadingService);
  private toast           = inject(ToastService);
  private fb              = inject(FormBuilder);

  compteur?:      CompteurResponse;
  statut?:        StatutConfig;
  dernierReleve?:  ReadingResponse;
  avantDernierReleve?: ReadingResponse;
  chartData:      BarChartData = { labels: [], values: [], color: '#F59E0B', unit: ' kWh' };

  isLoading    = true;
  showModal    = false;
  isSaving     = false;
  errorMessage = '';
  periodeStats = 'week';

  releveForm!: FormGroup;

  private polling?: Subscription;

  ngOnInit(): void {
    this.releveForm = this.fb.group({
      value:   ['', [Validators.required, Validators.min(0)]],
      comment: ['']
    });

    this.chargerTout();
    this.polling = interval(30_000).subscribe(() => this.chargerCompteur());
  }

  ngOnDestroy(): void {
    this.polling?.unsubscribe();
  }

  private chargerTout(): void {
    const id = this.compteurService.getCompteurIdSauvegarde();
    if (!id) { this.isLoading = false; return; }

    this.isLoading = true;

    this.compteurService.getCompteur(id).subscribe({
      next: (c) => {
        this.compteur  = c;
        this.isLoading = false;
        this.chargerStatut(id);
        this.chargerStats(id);
        this.chargerReleves(id);
      },
      error: () => { this.isLoading = false; }
    });
  }

  private chargerCompteur(): void {
    const id = this.compteurService.getCompteurIdSauvegarde();
    if (!id) return;
    this.compteurService.getCompteur(id).subscribe({
      next: (c) => { this.compteur = c; },
      error: () => {}
    });
  }

  private chargerStatut(id: number): void {
    this.compteurService.getStatutConfig(id).subscribe({
      next: (s) => { this.statut = s; },
      error: () => {}
    });
  }

  private chargerStats(id: number): void {
    this.compteurService.getStats(id, this.periodeStats).subscribe({
      next: (s) => {
        this.chartData = { labels: s.labels, values: s.consommations, color: '#F59E0B', unit: ' kWh' };
      },
      error: () => {}
    });
  }

  private chargerReleves(id: number): void {
    this.readingService.getReleves(id, 0, 2).subscribe({
      next: (p) => {
        this.dernierReleve      = p.content[0];
        this.avantDernierReleve = p.content[1];
      },
      error: () => {}
    });
  }

  get consommationEstimee(): number {
    if (!this.dernierReleve || !this.avantDernierReleve) return 0;
    return Math.max(0, this.dernierReleve.value - this.avantDernierReleve.value);
  }

  get estManuel(): boolean {
    return this.statut?.modeLectureConfigure === 'MANUAL';
  }

  ouvrirModal(): void {
    this.showModal = true;
    this.errorMessage = '';
    this.releveForm.reset();
  }

  fermerModal(): void { this.showModal = false; }

  get rf() { return this.releveForm.controls; }

  ajouterReleve(): void {
    if (this.releveForm.invalid) { this.releveForm.markAllAsTouched(); return; }

    const id = this.compteurService.getCompteurIdSauvegarde();
    if (!id) return;

    this.isSaving     = true;
    this.errorMessage = '';

    this.readingService.createReleveManuel({
      meterId: id,
      value:   +this.releveForm.value.value,
      comment: this.releveForm.value.comment ?? '',
      source:  'MANUAL'
    }).subscribe({
      next: () => {
        this.toast.success('Relevé enregistré !');
        this.fermerModal();
        this.chargerTout();
        this.isSaving = false;
      },
      error: (err) => { this.errorMessage = err.message; this.isSaving = false; }
    });
  }

  changerPeriode(p: string): void {
    this.periodeStats = p;
    const id = this.compteurService.getCompteurIdSauvegarde();
    if (id) this.chargerStats(id);
  }
}
