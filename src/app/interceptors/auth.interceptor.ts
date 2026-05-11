// Rôle : Intercepteur HTTP global qui ajoute automatiquement le token JWT.
// Évite d'ajouter manuellement le token à chaque requête vers les routes privées.

/*
┌─────────────────────────────────────────────────────┐
│              FLUX D'UNE REQUÊTE HTTP                │
│                                                     │
│  Composant Angular                                  │
│      │ appelle http.get('/api/truc')                │
│      ▼                                              │
│  authInterceptor                                    │
│      │                                             │
│      ├─ URL publique ? (/auth/login, /register)    │
│      │     └─► Laisse passer SANS token            │
│      │                                             │
│      └─ URL privée ?                               │
│            ├─ Token dans localStorage ?            │
│            │     └─► Ajoute header :               │
│            │         Authorization: Bearer eyJ...  │
│            └─ Pas de token → laisse passer         │
│                (le backend répondra 401)            │
│      │                                             │
│      ▼                                             │
│  Backend Spring Boot                               │
│      │                                             │
│      ├─ Répond 200 → données transmises            │
│      └─ Répond 401 → intercepteur déconnecte       │
│                       et redirige vers /login      │
└─────────────────────────────────────────────────────┘
*/

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { STORAGE_KEYS } from '../config/app.config.api';

// Liste des URLs qui N'ont PAS besoin du token JWT
// Ces routes sont publiques — le backend les accepte sans authentification
const PUBLIC_URLS: string[] = [
  '/auth/login',
  '/auth/register',
];

// Vérifie si une URL est publique (pas besoin de token)
function isPublicUrl(url: string): boolean {
  return PUBLIC_URLS.some(publicUrl => url.includes(publicUrl));
}

// L'intercepteur — fonction pure (style Standalone Angular)
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {

  const router = inject(Router);

  // Étape 1 : Lire le token sauvegardé dans localStorage
  const token = localStorage.getItem(STORAGE_KEYS.token);

  // Étape 2 : Si la route est publique OU s'il n'y a pas de token
  //           → laisser passer la requête sans modification
  if (isPublicUrl(req.url) || !token) {
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Même pour les routes publiques, on gère les erreurs réseau
        return handleError(error, router);
      })
    );
  }

  // Étape 3 : La route est privée ET on a un token
  //           → Cloner la requête et ajouter le header Authorization
  //           (on clone car les requêtes HTTP sont immuables en Angular)
  const requestWithToken = req.clone({
    setHeaders: {
      // Format standard JWT : "Bearer " + le token
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  // Étape 4 : Envoyer la requête modifiée et gérer les erreurs de retour
  return next(requestWithToken).pipe(
    catchError((error: HttpErrorResponse) => {

      // Si le backend répond 401 = token expiré ou invalide
      if (error.status === 401) {
        console.warn('Token expiré ou invalide — déconnexion automatique');

        // Nettoyer toutes les données de session
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });

        // Rediriger vers la page de connexion
        router.navigate(['/auth/login'], {
          queryParams: { reason: 'session_expiree' }
        });
      }

      return handleError(error, router);
    })
  );
};

// Fonction utilitaire : transforme les erreurs HTTP en messages français
function handleError(error: HttpErrorResponse, router: Router) {
  let message = 'Une erreur est survenue';

  switch (error.status) {
    case 0:
      // Pas de connexion réseau ou backend éteint
      message = 'Impossible de joindre le serveur. ' +
                'Vérifie que le backend Spring Boot tourne sur le port 8080.';
      break;
    case 400:
      message = error.error?.message || 'Données invalides. Vérifie le formulaire.';
      break;
    case 409:
      message = error.error?.message || 'Cette adresse email est déjà utilisée.';
      break;
    case 401:
      // Non authentifié
      message = 'Session expirée. Veuillez vous reconnecter.';
      break;
    case 403:
      // Authentifié mais pas autorisé
      message = "Vous n'avez pas les droits pour cette action.";
      break;
    case 404:
      message = 'Ressource introuvable.';
      break;
    case 500:
      message = 'Erreur serveur. Réessaie plus tard.';
      break;
  }

  // On retourne une erreur enrichie avec le message en français
  return throwError(() => new Error(message));
}
