// Rôle : Page de connexion pour les utilisateurs existants.
// Envoie les identifiants au backend et redirige selon le rôle.

import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="text-center">
          <h2 class="brand">MeterEye AI</h2>
          <h1 class="title">Connexion</h1>
        </div>

        <div *ngIf="sessionExpireeMsg" class="alert warning">
          {{ sessionExpireeMsg }}
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          
          <div class="form-group">
            <label for="email">Adresse email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              placeholder="votre@email.com"
            >
          </div>

          <div class="form-group">
            <label for="motDePasse">Mot de passe</label>
            <input 
              type="password" 
              id="motDePasse" 
              formControlName="motDePasse"
              [class.is-invalid]="loginForm.get('motDePasse')?.invalid && loginForm.get('motDePasse')?.touched"
              placeholder="••••••••"
            >
          </div>

          <div *ngIf="errorMessage" class="alert error">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary w-full" [disabled]="isLoading">
            <span *ngIf="isLoading" class="spinner"></span>
            <span *ngIf="!isLoading">Se connecter</span>
          </button>

        </form>

        <div class="text-center mt-4">
          <a routerLink="/register" class="link">Pas de compte ? Créer un compte</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f3f4f6;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .login-card {
      background: white;
      width: 100%;
      max-width: 420px;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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

    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #374151;
      font-weight: 500;
      font-size: 0.875rem;
    }
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    input:focus {
      outline: none;
      border-color: #16a34a;
      box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
    }
    input.is-invalid {
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
    .alert.warning {
      background-color: #fffbeb;
      color: #b45309;
      border: 1px solid #fcd34d;
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
export class LoginComponent implements OnInit {

  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private router      = inject(Router);
  private route       = inject(ActivatedRoute);

  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  sessionExpireeMsg = '';

  ngOnInit(): void {
    // Initialisation du formulaire réactif
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Vérifier si l'utilisateur a été redirigé ici parce que sa session a expiré
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'session_expiree') {
        this.sessionExpireeMsg = 'Votre session a expiré. Reconnectez-vous.';
      }
    });
  }

  onSubmit(): void {
    // 1. Vérifier si le formulaire est valide
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // 2. Lancer le chargement
    this.isLoading = true;
    this.errorMessage = '';
    this.sessionExpireeMsg = '';

    const { email, motDePasse } = this.loginForm.value;

    // 3. Appel au service d'authentification
    this.authService.login({ email, motDePasse }).subscribe({
      next: (response) => {
        // Succès → redirection selon le rôle
        this.naviguerSelonRole(response.role);
      },
      error: (err) => {
        // Erreur → affichage du message recu de l'intercepteur
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }

  // Redirige l'utilisateur vers le bon tableau de bord selon son rôle
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
