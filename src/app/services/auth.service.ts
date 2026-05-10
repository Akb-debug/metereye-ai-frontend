// Rôle : Gère les requêtes HTTP de login/register et l'état de connexion.
// Ce service n'ajoute pas le token lui-même (c'est le rôle de l'intercepteur).

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, RegisterRequest, UserState } from '../models/user.model';
import { API_URLS, STORAGE_KEYS } from '../config/app.config.api';

@Injectable({
  providedIn: 'root' // disponible dans toute l'application
})
export class AuthService {

  // Injection des dépendances (style moderne Angular)
  private http   = inject(HttpClient);
  private router = inject(Router);

  // BehaviorSubject = stocke l'état courant ET émet aux abonnés à chaque changement
  // Valeur initiale = non connecté
  private userStateSubject = new BehaviorSubject<UserState>({
    isLoggedIn: false,
    user: null
  });

  // Observable public que les composants peuvent écouter
  // On utilise $ comme convention pour les Observables
  public currentUser$ = this.userStateSubject.asObservable();

  constructor() {
    // Au démarrage du service, restaurer la session si token présent
    this.restaurerSession();
  }

  // ─────────────────────────────────────────────
  // CONNEXION
  // ─────────────────────────────────────────────
  // Envoie email + mot de passe au backend
  // Si succès → sauvegarde le token et met à jour l'état
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_URLS.login, request).pipe(
      tap((response: AuthResponse) => {
        // tap = effet de bord sans modifier la valeur de l'Observable
        this.sauvegarderSession(response);
      })
    );
    // Note : les erreurs sont gérées par l'intercepteur
    // Le composant qui appelle login() recevra un message d'erreur
    // déjà traduit en français par handleError() dans l'intercepteur
  }

  // ─────────────────────────────────────────────
  // INSCRIPTION
  // ─────────────────────────────────────────────
  // Envoie toutes les infos du nouvel utilisateur au backend
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_URLS.register, request).pipe(
      tap((response: AuthResponse) => {
        this.sauvegarderSession(response);
      })
    );
  }

  // ─────────────────────────────────────────────
  // DÉCONNEXION
  // ─────────────────────────────────────────────
  // Efface toutes les données de session et redirige vers /login
  logout(): void {
    // Supprimer toutes les clés du localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    // Remettre l'état à "non connecté"
    this.userStateSubject.next({
      isLoggedIn: false,
      user: null
    });

    // Rediriger vers la page de connexion
    this.router.navigate(['/login']);
  }

  // ─────────────────────────────────────────────
  // GETTERS PRATIQUES
  // ─────────────────────────────────────────────

  // Retourne true si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.token);
  }

  // Retourne le token JWT depuis localStorage
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.token);
  }

  // Retourne le rôle de l'utilisateur connecté
  getRole(): string | null {
    return localStorage.getItem(STORAGE_KEYS.role);
  }

  // Retourne le nom complet de l'utilisateur connecté
  getNomComplet(): string | null {
    return localStorage.getItem(STORAGE_KEYS.nomComplet);
  }

  // Retourne l'état courant (snapshot, pas un Observable)
  getCurrentUserState(): UserState {
    return this.userStateSubject.getValue();
  }

  // ─────────────────────────────────────────────
  // MÉTHODES PRIVÉES
  // ─────────────────────────────────────────────

  // Sauvegarde les données de session après login/register réussi
  private sauvegarderSession(response: AuthResponse): void {
    localStorage.setItem(STORAGE_KEYS.token,      response.token);
    localStorage.setItem(STORAGE_KEYS.role,       response.role);
    localStorage.setItem(STORAGE_KEYS.nomComplet, response.nomComplet);
    localStorage.setItem(STORAGE_KEYS.userId,     response.userId.toString());

    // Mettre à jour l'état global
    this.userStateSubject.next({
      isLoggedIn: true,
      user: response
    });
  }

  // Restaure la session depuis localStorage au démarrage de l'app
  private restaurerSession(): void {
    const token      = localStorage.getItem(STORAGE_KEYS.token);
    const role       = localStorage.getItem(STORAGE_KEYS.role);
    const nomComplet = localStorage.getItem(STORAGE_KEYS.nomComplet);
    const userId     = localStorage.getItem(STORAGE_KEYS.userId);

    if (token && role && nomComplet && userId) {
      // Session valide trouvée → restaurer l'état
      this.userStateSubject.next({
        isLoggedIn: true,
        user: {
          token,
          role,
          nomComplet,
          userId: parseInt(userId)
        }
      });
    }
  }
}
