import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FacturationService, RepartitionResponse, GenererFacturesRequest } from '../../services/facturation.service';
import { MaisonService } from '../../services/maison.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../shared/toast/toast.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-facturation',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ToastComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './facturation.component.html',
  styleUrl: './facturation.component.scss'
})
export class FacturationComponent implements OnInit {
  private facturationService = inject(FacturationService);
  private maisonService      = inject(MaisonService);
  private toast              = inject(ToastService);
  private fb                 = inject(FormBuilder);

  data = signal<RepartitionResponse | null>(null);
  isLoading = signal(true);
  isModalOpen = signal(false);
  isSubmitting = signal(false);

  maisonId?: number;
  currentMois = new Date().getMonth() + 1;
  currentAnnee = new Date().getFullYear();

  genForm!: FormGroup;

  moisList = [
    { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' }, { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' }, { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
  }

  initForm(): void {
    this.genForm = this.fb.group({
      montant: [19600, [Validators.required, Validators.min(0)]],
      locatairesSelectionnes: [[]] // On gère manuellement les checkboxes pour plus de flexibilité
    });
  }

  loadInitialData(): void {
    this.isLoading.set(true);
    this.maisonService.getMaisons().subscribe({
      next: (maisons) => {
        if (maisons.length > 0) {
          this.maisonId = maisons[0].id;
          this.fetchFactures();
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  fetchFactures(): void {
    if (!this.maisonId) return;
    this.isLoading.set(true);
    this.facturationService.getFacturesMaison(this.maisonId, this.currentMois, this.currentAnnee).subscribe({
      next: (res) => {
        this.data.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        // Si aucune facture n'existe, on peut charger un aperçu à 0
        this.loadApercu(0);
      }
    });
  }

  loadApercu(montant: number): void {
    if (!this.maisonId) return;
    this.facturationService.getApercu(this.maisonId, this.currentMois, this.currentAnnee, montant).subscribe({
      next: (res) => {
        this.data.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  onConfirmGenerer(): void {
    if (this.genForm.invalid || !this.maisonId) return;
    this.isSubmitting.set(true);

    const req: GenererFacturesRequest = {
      maisonId: this.maisonId,
      mois: this.currentMois,
      annee: this.currentAnnee,
      montantFacturePrincipale: this.genForm.value.montant,
      locatairesIds: [] // Dans un vrai cas, on mapperait les checkboxes
    };

    this.facturationService.genererFactures(req).subscribe({
      next: (res) => {
        this.data.set(res);
        this.toast.success('Factures générées avec succès !');
        this.isSubmitting.set(false);
        this.closeModal();
      },
      error: (err) => {
        this.toast.error(err?.message || 'Erreur lors de la génération');
        this.isSubmitting.set(false);
      }
    });
  }

  getLabelMois(m: number): string {
    return this.moisList.find(x => x.value === m)?.label || '';
  }
}
