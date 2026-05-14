import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { MaisonService } from '../../services/maison.service';
import { CompteurService } from '../../services/compteur.service';
import { SousCompteurService, SousCompteurRequest } from '../../services/sous-compteur.service';
import { SousCompteurResponse } from '../../models/sous-compteur.model';
import { MaisonResponse } from '../../models/maison.model';
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

  maison = signal<MaisonResponse | null>(null);
  sousCompteurs = signal<SousCompteurResponse[]>([]);
  stats = signal<any>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);
  isAddCompteurModalOpen = signal(false);

  addCompteurForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadMaisonData();
  }

  initForm(): void {
    this.addCompteurForm = this.fb.group({
      reference:           ['', [Validators.required]],
      descriptionLogement: ['', [Validators.required]],
      valeurInitiale:      [0, [Validators.required, Validators.min(0)]]
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
              
              // Charger les sous-compteurs séparément
              this.sousCompteurService.getSousCompteurs(detail.id).subscribe({
                next: (scs) => this.sousCompteurs.set(scs),
                error: () => this.sousCompteurs.set([])
              });

              if (detail.compteurPrincipalId) {
                this.compteurService.getStats(detail.compteurPrincipalId, 'month').subscribe({
                  next: (s) => this.stats.set(s),
                  error: () => {}
                });
              }
              this.isLoading.set(false);
            },
            error: () => {
              this.maison.set(m);
              // Tenter de charger les sous-compteurs quand même
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
      error: (err) => {
        this.toast.error('Erreur lors du chargement des données');
        this.isLoading.set(false);
      }
    });
  }

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
    const req: SousCompteurRequest = {
      ...this.addCompteurForm.value,
      maisonId: maisonId
    };

    this.sousCompteurService.creerSousCompteur(req).subscribe({
      next: () => {
        this.toast.success('Additionneuse ajoutée !');
        this.isSubmitting.set(false);
        this.closeAddCompteurModal();
        this.loadMaisonData(); // Rafraîchir la liste
      },
      error: (err) => {
        this.toast.error(err?.message || 'Erreur lors de l\'ajout');
        this.isSubmitting.set(false);
      }
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}

