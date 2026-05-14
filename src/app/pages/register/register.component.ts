import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../shared/toast/toast.component';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pwd     = group.get('motDePasse')?.value;
  const confirm = group.get('confirmMotDePasse')?.value;
  return pwd && confirm && pwd !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, ToastComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {

  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private router      = inject(Router);
  private toast       = inject(ToastService);

  registerForm!: FormGroup;
  isLoading           = false;
  errorMessage        = '';
  showPassword        = false;
  showConfirmPassword = false;

  roleOptions = [
    {
      value: 'PERSONNEL',
      label: 'Personnel',
      desc:  'Particulier avec son propre compteur Cash Power ou Classique.',
      icon:  'user'
    },
    {
      value: 'PROPRIETAIRE',
      label: 'Propriétaire',
      desc:  'Maison avec plusieurs locataires à gérer en sous-comptes.',
      icon:  'building'
    },
    {
      value: 'LOCATAIRE',
      label: 'Locataire',
      desc:  'Suit sa propre consommation via un accès partagé.',
      icon:  'home'
    }
  ];

  selectedRole = 'PERSONNEL';

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        prenom:             ['', [Validators.required, Validators.minLength(2)]],
        nom:                ['', [Validators.required, Validators.minLength(2)]],
        email:              ['', [Validators.required, Validators.email]],
        telephone:          ['', [Validators.required, Validators.pattern(/^[0-9\s-]{6,}$/)]],
        motDePasse:         ['', [Validators.required, Validators.minLength(6)]],
        confirmMotDePasse:  ['', Validators.required]
      },
      { validators: passwordMatchValidator }
    );
  }

  get f() { return this.registerForm.controls; }

  get passwordMismatch(): boolean {
    return !!(
      this.registerForm.hasError('passwordMismatch') &&
      this.f['confirmMotDePasse'].touched
    );
  }

  selectRole(role: string): void {
    this.selectedRole = role;
  }

  onSubmit(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;

    this.isLoading    = true;
    this.errorMessage = '';

    const { confirmMotDePasse, ...formData } = this.registerForm.value;
    const payload = { ...formData, role: this.selectedRole };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.toast.success('Compte créé avec succès ! Bienvenue sur MeterEye AI.');
        this.router.navigate(['/onboarding/compteur']);
      },
      error: (err: Error) => {
        this.isLoading    = false;
        this.errorMessage = err?.message ?? 'Erreur serveur, réessayez plus tard.';
      }
    });
  }
}
