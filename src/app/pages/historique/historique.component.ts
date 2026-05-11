// ✅ CRÉÉ — historique.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { ToastComponent } from '../../shared/toast/toast.component';

import { ReadingService } from '../../services/reading.service';
import { CompteurService } from '../../services/compteur.service';

import { ReadingResponse, PagedReadings } from '../../models/reading.model';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    SidebarComponent, HeaderComponent,
    LoadingSpinnerComponent, ToastComponent
  ],
  templateUrl: './historique.component.html',
  styleUrl: './historique.component.scss'
})
export class HistoriqueComponent implements OnInit {

  private readingService  = inject(ReadingService);
  private compteurService = inject(CompteurService);
  private fb              = inject(FormBuilder);

  releves:       ReadingResponse[] = [];
  isLoading      = true;
  totalElements  = 0;
  totalPages     = 0;
  currentPage    = 0;
  pageSize       = 10;

  filterForm!: FormGroup;

  sourceOptions = [
    { value: '',          label: 'Toutes les sources' },
    { value: 'MANUAL',    label: 'Manuelle' },
    { value: 'ESP32_CAM', label: 'ESP32-CAM' },
    { value: 'SENSOR',    label: 'PZEM-004T' }
  ];

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      source: ['']
    });

    this.charger();

    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 0;
      this.charger();
    });
  }

  charger(): void {
    const id = this.compteurService.getCompteurIdSauvegarde();
    if (!id) { this.isLoading = false; return; }

    this.isLoading = true;
    const source   = this.filterForm.value.source || undefined;

    this.readingService.getReleves(id, this.currentPage, this.pageSize, source).subscribe({
      next: (p: PagedReadings) => {
        this.releves       = p.content;
        this.totalElements = p.pageable?.totalElements ?? p.totalElements ?? 0;
        this.totalPages    = p.pageable?.totalPages    ?? p.totalPages    ?? 0;
        this.currentPage   = p.pageable?.page          ?? this.currentPage;
        this.isLoading     = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  goPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.charger();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  get debut(): number { return this.currentPage * this.pageSize + 1; }
  get fin():   number { return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements); }

  sourceBadge(source: string): string {
    switch (source) {
      case 'MANUAL':    return 'badge-gray';
      case 'ESP32_CAM': return 'badge-primary';
      case 'SENSOR':    return 'badge-warning';
      default:          return 'badge-gray';
    }
  }

  sourceLabel(source: string): string {
    switch (source) {
      case 'MANUAL':    return 'Manuel';
      case 'ESP32_CAM': return 'ESP32-CAM';
      case 'SENSOR':    return 'PZEM-004T';
      default:          return source;
    }
  }
}
