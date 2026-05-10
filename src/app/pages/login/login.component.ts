// 🔄 MODIFIÉ — login.component.ts — ajouts : design system, redirection smart par compteur

import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CompteurService } from '../../services/compteur.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../shared/toast/toast.component';
import { STORAGE_KEYS } from '../../config/app.config.api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, ToastComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  private fb              = inject(FormBuilder);
  private authService     = inject(AuthService);
  private compteurService = inject(CompteurService);
  private router          = inject(Router);
  private route           = inject(ActivatedRoute);
  private toast           = inject(ToastService);

  loginForm!: FormGroup;
  isLoading        = false;
  errorMessage     = '';
  sessionExpireeMsg = '';
  showPassword     = false;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email:      ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'session_expiree') {
        this.sessionExpireeMsg = 'Votre session a expiré. Veuillez vous reconnecter.';
      }
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => this.redirectApresLogin(),
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }

  private redirectApresLogin(): void {
    this.compteurService.getMesCompteurs().subscribe({
      next: (compteurs) => {
        this.isLoading = false;
        if (!compteurs || compteurs.length === 0) {
          this.router.navigate(['/onboarding/compteur']);
        } else {
          const c = compteurs[0];
          this.compteurService.sauvegarderCompteurId(c.id);
          this.compteurService.sauvegarderTypeCompteur(c.typeCompteur);
          this.router.navigate(
            c.typeCompteur === 'CASH_POWER' ? ['/dashboard/cashpower'] : ['/dashboard/classique']
          );
        }
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/onboarding/compteur']);
      }
    });
  }
}
