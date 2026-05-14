import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { LocataireService, CreerLocataireRequest } from '../../services/locataire.service';
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

  locataires = signal<SousCompteurResponse[]>([]);
  availableSousCompteurs = signal<SousCompteurResponse[]>([]);
  isLoading  = signal(true);
  
  isModalOpen = signal(false);
  isAddCompteurModalOpen = signal(false);
  isSubmitting = signal(false);

  maisonId?: number;
  addForm!: FormGroup;
  addCompteurForm!: FormGroup;

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

  openModal(): void {
    this.addForm.reset();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  openAddCompteurModal(): void {
    this.addCompteurForm.reset({ valeurInitiale: 0 });
    this.isAddCompteurModalOpen.set(true);
  }

  closeAddCompteurModal(): void {
    this.isAddCompteurModalOpen.set(false);
  }

  onSubmit(): void {
    if (this.addForm.invalid) return;
    this.isSubmitting.set(true);

    const req = {
      nom:            this.addForm.value.nom,
      prenom:         this.addForm.value.prenom,
      email:          this.addForm.value.email,
      telephone:      this.addForm.value.telephone,
      sousCompteurId: Number(this.addForm.value.sousCompteurId),
      motDePasseTemporaire: this.addForm.value.motDePasseTemp
    };
    this.locataireService.creerLocataire(req).subscribe({
      next: () => {
        this.toast.success('Locataire créé avec succès !');
        this.isSubmitting.set(false);
        this.closeModal();
        this.loadData(); // Recharger tout car les compteurs libres ont changé
      },
      error: (err) => {
        this.toast.error(err?.message || 'Erreur lors de la création');
        this.isSubmitting.set(false);
      }
    });
  }

  onSubmitCompteur(): void {
    if (this.addCompteurForm.invalid || !this.maisonId) return;
    this.isSubmitting.set(true);

    const req: SousCompteurRequest = {
      ...this.addCompteurForm.value,
      maisonId: this.maisonId
    };

    this.sousCompteurService.creerSousCompteur(req).subscribe({
      next: () => {
        this.toast.success('Additionneuse ajoutée avec succès !');
        this.isSubmitting.set(false);
        this.closeAddCompteurModal();
        this.loadAvailableCompteurs(); // Recharger les compteurs dispos
      },
      error: (err) => {
        this.toast.error(err?.message || 'Erreur lors de l\'ajout');
        this.isSubmitting.set(false);
      }
    });
  }

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
}

