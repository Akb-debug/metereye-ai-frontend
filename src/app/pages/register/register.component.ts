// Rôle : Formulaire d'inscription pour créer un nouveau compte.
// Recueille les infos et envoie l'inscription au backend.

import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="text-center">
          <h2 class="brand">MeterEye AI</h2>
          <h1 class="title">Inscription</h1>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          
          <div class="grid-2">
            <div class="form-group">
              <label for="nom">Nom</label>
              <input type="text" id="nom" formControlName="nom" [class.is-invalid]="f['nom'].invalid && f['nom'].touched">
            </div>
            <div class="form-group">
              <label for="prenom">Prénom</label>
              <input type="text" id="prenom" formControlName="prenom" [class.is-invalid]="f['prenom'].invalid && f['prenom'].touched">
            </div>
          </div>

          <div class="form-group">
            <label for="email">Adresse email</label>
            <input type="email" id="email" formControlName="email" [class.is-invalid]="f['email'].invalid && f['email'].touched">
          </div>

          <div class="form-group">
            <label for="telephone">Téléphone</label>
            <input type="text" id="telephone" formControlName="telephone" [class.is-invalid]="f['telephone'].invalid && f['telephone'].touched">
          </div>

          <div class="form-group">
            <label for="role">Type de compte</label>
            <select id="role" formControlName="role" [class.is-invalid]="f['role'].invalid && f['role'].touched">
              <option value="" disabled selected>Sélectionnez un type</option>
              <option value="PROPRIETAIRE">Propriétaire</option>
              <option value="LOCATAIRE">Locataire</option>
              <option value="CASHPOWER">Abonné Cash Power</option>
              <option value="CLASSIQUE">Abonné Classique</option>
            </select>
          </div>

          <div class="form-group">
            <label for="motDePasse">Mot de passe</label>
            <input type="password" id="motDePasse" formControlName="motDePasse" [class.is-invalid]="f['motDePasse'].invalid && f['motDePasse'].touched">
          </div>

          <div *ngIf="errorMessage" class="alert error">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary w-full" [disabled]="isLoading">
            <span *ngIf="isLoading" class="spinner"></span>
            <span *ngIf="!isLoading">Créer mon compte</span>
          </button>

        </form>

        <div class="text-center mt-4">
          <a routerLink="/login" class="link">Déjà un compte ? Se connecter</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f3f4f6;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 2rem 1rem;
      box-sizing: border-box;
    }
    .register-card {
      background: white;
      width: 100%;
      max-width: 500px;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      box-sizing: border-box;
    }
    .text-center { text-align: center; }
    .mt-4 { margin-top: 1rem; }
    .w-full { width: 100%; }
    
    .brand {
      color: #16a34a;
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
    }
    .title {
      font-size: 1.75rem;
      color: #111827;
      margin-top: 0;
      margin-bottom: 2rem;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #374151;
      font-weight: 500;
      font-size: 0.875rem;
    }
    input, select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
      transition: border-color 0.2s;
      background-color: white;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #16a34a;
      box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
    }
    input.is-invalid, select.is-invalid {
      border-color: #ef4444;
    }

    .alert {
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }
    .alert.error {
      background-color: #fef2f2;
      color: #b91c1c;
      border: 1px solid #f87171;
    }

    .btn {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      border: none;
      transition: background-color 0.2s;
    }
    .btn-primary {
      background-color: #16a34a;
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      background-color: #15803d;
    }
    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .link {
      color: #16a34a;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .link:hover {
      text-decoration: underline;
    }

    .spinner {
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top: 3px solid white;
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class RegisterComponent implements OnInit {

  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private router      = inject(Router);

  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    // Initialisation du formulaire réactif
    this.registerForm = this.fb.group({
      nom:        ['', [Validators.required, Validators.minLength(2)]],
      prenom:     ['', [Validators.required, Validators.minLength(2)]],
      email:      ['', [Validators.required, Validators.email]],
      telephone:  ['', [Validators.required, Validators.minLength(8)]],
      role:       ['', [Validators.required]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Getter de raccourci pour les contrôles du form
  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = this.registerForm.value;

    this.authService.register(formData).subscribe({
      next: (response) => {
        this.naviguerSelonRole(response.role);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }

  private naviguerSelonRole(role: string): void {
    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/dashboard/admin']);
        break;
      case 'PROPRIETAIRE':
        this.router.navigate(['/dashboard/proprietaire']);
        break;
      case 'LOCATAIRE':
        this.router.navigate(['/dashboard/locataire']);
        break;
      case 'CASHPOWER':
        this.router.navigate(['/dashboard/cashpower']);
        break;
      case 'CLASSIQUE':
        this.router.navigate(['/dashboard/classique']);
        break;
      default:
        this.router.navigate(['/dashboard/classique']);
        break;
    }
  }
}
