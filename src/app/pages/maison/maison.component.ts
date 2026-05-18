import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { MaisonService } from '../../services/maison.service';
import { CompteurService } from '../../services/compteur.service';
import { SousCompteurService, SousCompteurRequest } from '../../services/sous-compteur.service';
import { SousCompteurResponse } from '../../models/sous-compteur.model';
import { MaisonResponse } from '../../models/maison.model';
import { CompteurResponse } from '../../models/compteur.model';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../shared/toast/toast.component';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-maison',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ToastComponent, RouterModule, ReactiveFormsModule],
  templateUrl: './maison.component.html',
  styleUrl: './maison.component.scss'
})
export class MaisonComponent implements OnInit {
  private maisonService       = inject(MaisonService);
  private compteurService     = inject(CompteurService);
  private sousCompteurService = inject(SousCompteurService);
  private toast               = inject(ToastService);
  private fb                  = inject(FormBuilder);

  maison            = signal<MaisonResponse | null>(null);
  compteurPrincipal = signal<CompteurResponse | null>(null);
  sousCompteurs     = signal<SousCompteurResponse[]>([]);
  stats             = signal<any>(null);
  isLoading         = signal(true);
  isSubmitting      = signal(false);

  isAddCompteurModalOpen      = signal(false);
  isEditMaisonModalOpen       = signal(false);
  isEditSousCompteurModalOpen = signal(false);
  isDetailSousCompteurOpen    = signal(false);
  selectedSousCompteur        = signal<SousCompteurResponse | null>(null);

  addCompteurForm!:     FormGroup;
  editMaisonForm!:      FormGroup;
  editSousCompteurForm!: FormGroup;

  ngOnInit(): void {
    this.initForms();
    this.loadMaisonData();
  }

  initForms(): void {
    this.addCompteurForm = this.fb.group({
      reference:           ['', [Validators.required]],
      descriptionLogement: ['', [Validators.required]],
      valeurInitiale:      [0, [Validators.required, Validators.min(0)]]
    });

    this.editMaisonForm = this.fb.group({
      nom:         ['', [Validators.required]],
      adresse:     ['', [Validators.required]],
      description: ['']
    });

    this.editSousCompteurForm = this.fb.group({
      reference:           ['', [Validators.required]],
      descriptionLogement: ['', [Validators.required]]
    });
  }

  loadMaisonData(): void {
    this.isLoading.set(true);
    this.maisonService.getMaisons().subscribe({
      next: (maisons) => {
        if (maisons.length > 0) {
          const m = maisons[0];
          this.maisonService.getMaison(m.id).subscribe({
            next: (detail) => {
              this.maison.set(detail);
              this.sousCompteurService.getSousCompteurs(detail.id).subscribe({
                next: (scs) => this.sousCompteurs.set(scs),
                error: () => this.sousCompteurs.set([])
              });
              if (detail.compteurPrincipalId) {
                const id = detail.compteurPrincipalId;
                this.compteurService.getCompteur(id).subscribe({
                  next: (c) => this.compteurPrincipal.set(c),
                  error: () => {}
                });
                this.compteurService.getStats(id, 'month').subscribe({
                  next: (s) => this.stats.set(s),
                  error: () => {}
                });
              }
              this.isLoading.set(false);
            },
            error: () => {
              this.maison.set(m);
              this.sousCompteurService.getSousCompteurs(m.id).subscribe({
                next: (scs) => this.sousCompteurs.set(scs),
                error: () => this.sousCompteurs.set([])
              });
              this.isLoading.set(false);
            }
          });
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.toast.error('Erreur lors du chargement des données');
        this.isLoading.set(false);
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
    const maisonId = this.maison()?.id;
    if (this.addCompteurForm.invalid || !maisonId) return;
    this.isSubmitting.set(true);
    const req: SousCompteurRequest = { ...this.addCompteurForm.value, maisonId };
    this.sousCompteurService.creerSousCompteur(req).subscribe({
      next: () => {
        this.toast.success('Additionneuse ajoutée !');
        this.isSubmitting.set(false);
        this.closeAddCompteurModal();
        this.loadMaisonData();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Erreur lors de l\'ajout');
        this.isSubmitting.set(false);
      }
    });
  }

  // ── Modifier maison ────────────────────────────
  openEditMaisonModal(): void {
    const m = this.maison();
    if (!m) return;
    this.editMaisonForm.patchValue({ nom: m.nom, adresse: m.adresse, description: m.description || '' });
    this.isEditMaisonModalOpen.set(true);
  }

  closeEditMaisonModal(): void {
    this.isEditMaisonModalOpen.set(false);
  }

  onSubmitEditMaison(): void {
    const id = this.maison()?.id;
    if (this.editMaisonForm.invalid || !id) return;
    this.isSubmitting.set(true);
    this.maisonService.updateMaison(id, this.editMaisonForm.value).subscribe({
      next: (updated) => {
        this.maison.set(updated);
        this.toast.success('Maison mise à jour !');
        this.isSubmitting.set(false);
        this.closeEditMaisonModal();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Erreur lors de la mise à jour');
        this.isSubmitting.set(false);
      }
    });
  }

  // ── Détails additionneuse ──────────────────────
  ouvrirDetailSousCompteur(sub: SousCompteurResponse): void {
    this.selectedSousCompteur.set(sub);
    this.isDetailSousCompteurOpen.set(true);
  }

  fermerDetailSousCompteur(): void {
    this.isDetailSousCompteurOpen.set(false);
    this.selectedSousCompteur.set(null);
  }

  // ── Modifier additionneuse ─────────────────────
  openEditSousCompteurModal(sub: SousCompteurResponse): void {
    this.selectedSousCompteur.set(sub);
    this.editSousCompteurForm.patchValue({ reference: sub.reference, descriptionLogement: sub.descriptionLogement });
    this.isEditSousCompteurModalOpen.set(true);
  }

  closeEditSousCompteurModal(): void {
    this.isEditSousCompteurModalOpen.set(false);
    this.selectedSousCompteur.set(null);
  }

  onSubmitEditSousCompteur(): void {
    const sub = this.selectedSousCompteur();
    if (this.editSousCompteurForm.invalid || !sub) return;
    this.isSubmitting.set(true);
    this.sousCompteurService.updateSousCompteur(sub.id, this.editSousCompteurForm.value).subscribe({
      next: () => {
        this.toast.success('Additionneuse mise à jour !');
        this.isSubmitting.set(false);
        this.closeEditSousCompteurModal();
        this.loadMaisonData();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Erreur lors de la mise à jour');
        this.isSubmitting.set(false);
      }
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
