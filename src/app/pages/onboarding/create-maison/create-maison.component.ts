import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MaisonService } from '../../../services/maison.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ToastComponent } from '../../../shared/toast/toast.component';
import { CompteurService } from '../../../services/compteur.service';

@Component({
  selector: 'app-create-maison',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastComponent],
  templateUrl: './create-maison.component.html',
  styleUrl: './create-maison.component.scss'
})
export class CreateMaisonComponent implements OnInit {
  private fb            = inject(FormBuilder);
  private maisonService = inject(MaisonService);
  private authService   = inject(AuthService);
  public  router          = inject(Router);
  private toast           = inject(ToastService);
  private compteurService = inject(CompteurService);

  form!: FormGroup;
  isLoading    = false;
  errorMessage = '';

  get nomComplet(): string {
    return this.authService.getNomComplet();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      nom:         ['', [Validators.required, Validators.minLength(3)]],
      adresse:     ['', [Validators.required, Validators.minLength(5)]],
      description: ['']
    });
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = { 
      ...this.form.value, 
      compteurPrincipalId: this.compteurService.getCompteurIdSauvegarde() 
    };

    this.maisonService.createMaison(payload).subscribe({
      next: (m) => {
        this.isLoading = false;
        this.toast.success('Maison liée avec succès !');
        this.router.navigate(['/onboarding/mode-lecture']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.message ?? 'Erreur lors de l\'enregistrement de la maison.';
      }
    });
  }

  seDeconnecter(): void {
    this.authService.logout();
  }
}
