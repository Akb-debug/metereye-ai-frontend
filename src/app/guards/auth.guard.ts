// 🔄 MODIFIÉ — auth.guard.ts — ajouts : redirection smart selon typeCompteur

import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { STORAGE_KEYS } from '../config/app.config.api';

export const authGuard: CanActivateFn = (_route, state) => {

  const authService = inject(AuthService);
  const router      = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  return true;
};

export const redirectIfLoggedInGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router      = inject(Router);

  if (authService.isLoggedIn()) {
    const type = localStorage.getItem(STORAGE_KEYS.typeCompteur);
    if (type === 'CASH_POWER') {
      router.navigate(['/dashboard/cashpower']);
    } else if (type === 'CLASSIQUE') {
      router.navigate(['/dashboard/classique']);
    } else {
      router.navigate(['/onboarding/compteur']);
    }
    return false;
  }

  return true;
};
