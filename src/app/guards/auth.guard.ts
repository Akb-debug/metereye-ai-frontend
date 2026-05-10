// Rôle : Protège les routes privées de l'application (ex: /dashboard).
// Redirige les utilisateurs non connectés vers la page de connexion.

import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router      = inject(Router);

  if (authService.isLoggedIn()) {
    // Utilisateur connecté → accès autorisé
    return true;
  }

  // Non connecté → rediriger vers /login
  // On sauvegarde l'URL demandée pour y revenir potentiellement après connexion
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
