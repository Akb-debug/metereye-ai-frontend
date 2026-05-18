import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { STORAGE_KEYS } from '../config/app.config.api';

// ── Garde générique : doit être connecté ───────────────────────────────────
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  return true;
};

// ── Redirige si déjà connecté (pages login/register) ───────────────────────
export const redirectIfLoggedInGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  if (authService.isLoggedIn()) {
    const role = authService.getUserRole();

    if (role === 'PROPRIETAIRE') {
      router.navigate(['/dashboard/proprietaire']);
    } else if (role === 'LOCATAIRE') {
      router.navigate(['/dashboard/locataire']);
    } else {
      const type = localStorage.getItem(STORAGE_KEYS.typeCompteur);
      if (type === 'CASH_POWER') {
        router.navigate(['/dashboard/cashpower']);
      } else if (type === 'CLASSIQUE') {
        router.navigate(['/dashboard/classique']);
      } else {
        router.navigate(['/onboarding/compteur']);
      }
    }
    return false;
  }
  return true;
};

// ── Réservé aux PROPRIÉTAIRES ───────────────────────────────────────────────
export const proprietaireGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (authService.getUserRole() !== 'PROPRIETAIRE') {
    router.navigate(['/dashboard/locataire']);
    return false;
  }
  return true;
};

// ── Réservé aux LOCATAIRES ──────────────────────────────────────────────────
export const locataireGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (authService.getUserRole() !== 'LOCATAIRE') {
    router.navigate(['/dashboard/proprietaire']);
    return false;
  }
  return true;
};
