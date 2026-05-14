import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { switchMap, tap, of } from 'rxjs';
import { CompteurService } from '../../../services/compteur.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ToastComponent } from '../../../shared/toast/toast.component';

@Component({
  selector: 'app-create-compteur',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ToastComponent],
  templateUrl: './create-compteur.component.html',
  styleUrl: './create-compteur.component.scss'
})
export class CreateCompteurComponent implements OnInit {

  private fb              = inject(FormBuilder);
  private compteurService = inject(CompteurService);
  private authService     = inject(AuthService);
  private router          = inject(Router);
  private toast           = inject(ToastService);

  form!: FormGroup;
  isLoading              = false;
  errorMessage           = '';
  typeSelectionne: 'CLASSIQUE' | 'CASH_POWER' = 'CASH_POWER';

  get nomComplet(): string { return this.authService.getNomComplet(); }
  get isProprietaire(): boolean { return this.authService.getUserRole() === 'PROPRIETAIRE'; }

  ngOnInit(): void {
    this.form = this.fb.group({
      reference:      ['', [Validators.required, Validators.minLength(4)]],
      adresse:        ['', [Validators.required, Validators.minLength(5)]],
      valeurInitiale: [null, [Validators.required, Validators.min(0)]]
    });
  }

  get f() { return this.form.controls; }

  selectType(type: 'CLASSIQUE' | 'CASH_POWER'): void {
    this.typeSelectionne = type;
  }

  seDeconnecter(): void {
    this.authService.logout();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isLoading    = true;
    this.errorMessage = '';

    const payload = { ...this.form.value, typeCompteur: this.typeSelectionne };

    this.compteurService.createCompteur(payload).pipe(
      switchMap((compteur) => {
        if (compteur?.id) {
          // Backend returned the created compteur with its ID
          this.compteurService.sauvegarderCompteurId(compteur.id);
          this.compteurService.sauvegarderTypeCompteur(compteur.typeCompteur ?? this.typeSelectionne);
          return of(null);
        }
        // Backend returned 201 No Content — recover ID via GET /compteurs
        return this.compteurService.getMesCompteurs().pipe(
          tap((list) => {
            const c = list?.[list.length - 1];
            if (c?.id) {
              this.compteurService.sauvegarderCompteurId(c.id);
              this.compteurService.sauvegarderTypeCompteur(c.typeCompteur);
            }
          })
        );
      })
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.toast.success('Compteur enregistré avec succès !');
        if (this.isProprietaire) {
          this.router.navigate(['/onboarding/maison']);
        } else {
          this.router.navigate(['/onboarding/mode-lecture']);
        }
      },
      error: (err: Error) => {
        this.isLoading    = false;
        this.errorMessage = err.message ?? 'Erreur serveur, réessayez.';
      }
    });
  }
}
