// 🔄 MODIFIÉ — register.component.ts — ajouts : cards PERSONNEL/PROPRIÉTAIRE, design system, redirection onboarding

import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../shared/toast/toast.component';

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
  isLoading    = false;
  errorMessage = '';
  showPassword = false;

  roleOptions = [
    {
      value: 'PERSONNEL',
      label: 'Compte Personnel',
      desc: 'Vous avez votre propre compteur et souhaitez suivre votre consommation personnelle.',
      icon: 'user'
    },
    {
      value: 'PROPRIETAIRE',
      label: 'Propriétaire',
      desc: 'Vous gérez plusieurs compteurs pour vos locataires ou co-propriétaires.',
      icon: 'building'
    }
  ];

  selectedRole = 'PERSONNEL';

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nom:        ['', [Validators.required, Validators.minLength(2)]],
      prenom:     ['', [Validators.required, Validators.minLength(2)]],
      email:      ['', [Validators.required, Validators.email]],
      telephone:  ['', [Validators.required, Validators.pattern(/^[0-9+\s-]{8,}$/)]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.registerForm.controls; }

  selectRole(role: string): void {
    this.selectedRole = role;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    const payload = {
      ...this.registerForm.value,
      role: this.selectedRole
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.toast.success('Compte créé avec succès ! Bienvenue sur MeterEye AI.');
        this.router.navigate(['/onboarding/compteur']);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }
}
