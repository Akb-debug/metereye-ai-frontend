import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FacturationService, RepartitionResponse, GenererFacturesRequest } from '../../services/facturation.service';
import { MaisonService } from '../../services/maison.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../shared/toast/toast.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
  selectedLocatairesIds: number[] = [];

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
      montant: [0, [Validators.required, Validators.min(0)]],
      locatairesSelectionnes: [[]] // On gère manuellement les checkboxes pour plus de flexibilité
    });

    this.genForm.get('montant')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(val => {
      if (val !== null && val >= 0 && this.isModalOpen()) {
        this.loadApercu(val);
      }
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
        
        // Mettre à jour la sélection par défaut si la modale est ouverte
        if (this.isModalOpen()) {
          const items = res.items || [];
          this.selectedLocatairesIds = items
            .filter(i => i.statut !== 'GENEREE' && i.locataireId)
            .map(i => i.locataireId!);
        }
        
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openModal(): void {
    const currentMontant = this.data()?.montantFacturePrincipale || 0;
    this.genForm.patchValue({ montant: currentMontant }, { emitEvent: false });
    
    const items = this.data()?.items || [];
    this.selectedLocatairesIds = items
      .filter(i => i.statut !== 'GENEREE' && i.locataireId)
      .map(i => i.locataireId!);
      
    this.isModalOpen.set(true);
  }

  toggleLocataire(id: number | undefined, event: any): void {
    if (!id) return;
    if (event.target.checked) {
      if (!this.selectedLocatairesIds.includes(id)) {
        this.selectedLocatairesIds.push(id);
      }
    } else {
      this.selectedLocatairesIds = this.selectedLocatairesIds.filter(x => x !== id);
    }
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
      locatairesIds: this.selectedLocatairesIds
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

  telechargerFacture(factureId?: number): void {
    if (!factureId) return;
    this.facturationService.telechargerFacture(factureId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Facture_${factureId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toast.error('Erreur lors du téléchargement')
    });
  }

  telechargerTout(): void {
    const items = this.data()?.items?.filter(i => i.statut === 'GENEREE' && i.factureId) || [];
    if (items.length === 0) {
      this.toast.error('Aucune facture générée à télécharger');
      return;
    }
    items.forEach(item => this.telechargerFacture(item.factureId));
  }
}
