import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CompteurService } from '../../services/compteur.service';
import { ToastComponent } from '../../shared/toast/toast.component';

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
        const msg: string = err?.message ?? '';
        // L'intercepteur mappe le 401 vers "Session expirée" mais sur la page
        // de login, un 401 signifie simplement identifiants incorrects.
        this.errorMessage = msg.toLowerCase().includes('session') || msg.toLowerCase().includes('expir')
          ? 'Email ou mot de passe incorrect.'
          : (msg || 'Email ou mot de passe incorrect.');
        this.isLoading = false;
      }
    });
  }

  private redirectApresLogin(): void {
    const role = this.authService.getUserRole();
    this.isLoading = false;

    if (role === 'LOCATAIRE') {
      this.router.navigate(['/dashboard/locataire']);
      return;
    }

    if (role === 'PROPRIETAIRE') {
      this.router.navigate(['/dashboard/proprietaire']);
      return;
    }

    // Rôle inconnu : déduire le dashboard depuis le type de compteur
    this.compteurService.getMesCompteurs().subscribe({
      next: (compteurs) => {
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
      error: () => this.router.navigate(['/onboarding/compteur'])
    });
  }
}
