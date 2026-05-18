import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { LocataireService } from '../../services/locataire.service';
import { MaisonService } from '../../services/maison.service';
import { SousCompteurService, SousCompteurRequest } from '../../services/sous-compteur.service';
import { SousCompteurResponse } from '../../models/sous-compteur.model';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../shared/toast/toast.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-locataires',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ToastComponent, ReactiveFormsModule],
  templateUrl: './locataires.component.html',
  styleUrl: './locataires.component.scss'
})
export class LocatairesComponent implements OnInit {
  private locataireService    = inject(LocataireService);
  private maisonService       = inject(MaisonService);
  private sousCompteurService = inject(SousCompteurService);
  private toast               = inject(ToastService);
  private fb                  = inject(FormBuilder);

  locataires             = signal<SousCompteurResponse[]>([]);
  availableSousCompteurs = signal<SousCompteurResponse[]>([]);
  isLoading              = signal(true);

  isModalOpen             = signal(false);
  isAddCompteurModalOpen  = signal(false);
  isDetailModalOpen       = signal(false);
  isEditLocataireModalOpen = signal(false);
  isSubmitting            = signal(false);

  selectedLocataire = signal<SousCompteurResponse | null>(null);
  maisonId?: number;

  addForm!:            FormGroup;
  addCompteurForm!:    FormGroup;
  editLocataireForm!:  FormGroup;

  ngOnInit(): void {
    this.initForms();
    this.loadData();
  }

  initForms(): void {
    this.addForm = this.fb.group({
      nom:            ['', [Validators.required]],
      prenom:         ['', [Validators.required]],
      email:          ['', [Validators.required, Validators.email]],
      telephone:      ['', [Validators.required]],
      sousCompteurId: ['', [Validators.required]],
      motDePasseTemp: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.addCompteurForm = this.fb.group({
      reference:           ['', [Validators.required]],
      descriptionLogement: ['', [Validators.required]],
      valeurInitiale:      [0, [Validators.required, Validators.min(0)]]
    });

    this.editLocataireForm = this.fb.group({
      reference:           ['', [Validators.required]],
      descriptionLogement: ['', [Validators.required]]
    });
  }

  loadData(): void {
    this.isLoading.set(true);
    this.maisonService.getMaisons().subscribe({
      next: (maisons) => {
        if (maisons.length > 0) {
          this.maisonId = maisons[0].id;
          this.loadLocataires();
          this.loadAvailableCompteurs();
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadLocataires(): void {
    if (!this.maisonId) return;
    this.locataireService.getLocatairesByMaison(this.maisonId).subscribe({
      next: (data) => {
        this.locataires.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadAvailableCompteurs(): void {
    if (!this.maisonId) return;
    this.sousCompteurService.getSousCompteursLibres(this.maisonId).subscribe({
      next: (data) => this.availableSousCompteurs.set(data),
      error: () => {}
    });
  }

  // ── Ajouter locataire ──────────────────────────
  openModal(): void {
    this.addForm.reset();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  onSubmit(): void {
    if (this.addForm.invalid) return;
    this.isSubmitting.set(true);
    const req = {
      nom:                  this.addForm.value.nom,
      prenom:               this.addForm.value.prenom,
      email:                this.addForm.value.email,
      telephone:            this.addForm.value.telephone,
      sousCompteurId:       Number(this.addForm.value.sousCompteurId),
      motDePasseTemporaire: this.addForm.value.motDePasseTemp
    };
    this.locataireService.creerLocataire(req).subscribe({
      next: () => {
        this.toast.success('Locataire créé avec succès !');
        this.isSubmitting.set(false);
        this.closeModal();
        this.loadData();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Erreur lors de la création');
        this.isSubmitting.set(false);
      }
    });
  }

  // ── Ajouter additionneuse ──────────────────────
  openAddCompteurModal(): void {
    this.addCompteurForm.reset({ valeurInitiale: 0 });
    this.isAddCompteurModalOpen.set(true);
  }

  closeAddCompteurModal(): void {
    this.isAddCompteurModalOpen.set(false);
  }

  onSubmitCompteur(): void {
    if (this.addCompteurForm.invalid || !this.maisonId) return;
    this.isSubmitting.set(true);
    const req: SousCompteurRequest = { ...this.addCompteurForm.value, maisonId: this.maisonId };
    this.sousCompteurService.creerSousCompteur(req).subscribe({
      next: () => {
        this.toast.success('Additionneuse ajoutée avec succès !');
        this.isSubmitting.set(false);
        this.closeAddCompteurModal();
        this.loadAvailableCompteurs();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Erreur lors de l\'ajout');
        this.isSubmitting.set(false);
      }
    });
  }

  // ── Détails locataire ──────────────────────────
  ouvrirDetail(loc: SousCompteurResponse): void {
    this.selectedLocataire.set(loc);
    this.isDetailModalOpen.set(true);
  }

  fermerDetail(): void {
    this.isDetailModalOpen.set(false);
  }

  // ── Modifier locataire ─────────────────────────
  ouvrirEdit(loc: SousCompteurResponse): void {
    this.selectedLocataire.set(loc);
    this.editLocataireForm.patchValue({ reference: loc.reference, descriptionLogement: loc.descriptionLogement });
    this.isEditLocataireModalOpen.set(true);
  }

  fermerEdit(): void {
    this.isEditLocataireModalOpen.set(false);
    this.selectedLocataire.set(null);
  }

  onSubmitEdit(): void {
    const loc = this.selectedLocataire();
    if (this.editLocataireForm.invalid || !loc) return;
    this.isSubmitting.set(true);
    this.sousCompteurService.updateSousCompteur(loc.id, this.editLocataireForm.value).subscribe({
      next: () => {
        this.toast.success('Additionneuse mise à jour !');
        this.isSubmitting.set(false);
        this.fermerEdit();
        this.loadData();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Erreur lors de la mise à jour');
        this.isSubmitting.set(false);
      }
    });
  }

  // ── Désactiver locataire ───────────────────────
  deleteLocataire(id: number): void {
    if (confirm('Voulez-vous vraiment désactiver ce locataire ?')) {
      this.locataireService.desactiverLocataire(id).subscribe({
        next: () => {
          this.toast.success('Locataire désactivé');
          this.loadData();
        },
        error: () => this.toast.error('Erreur lors de la désactivation')
      });
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
