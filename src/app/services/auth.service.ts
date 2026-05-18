// 🔄 MODIFIÉ — auth.service.ts — corrections: sauvegarderSession lit nomComplet/userId, register enchaîne login

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, RegisterRequest, UserState } from '../models/user.model';
import { API_URLS, STORAGE_KEYS } from '../config/app.config.api';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http   = inject(HttpClient);
  private router = inject(Router);

  private userStateSubject = new BehaviorSubject<UserState>({
    isLoggedIn: false,
    user: null
  });

  public currentUser$ = this.userStateSubject.asObservable();

  constructor() {
    this.restaurerSession();
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_URLS.login, request).pipe(
      tap((r: AuthResponse) => this.sauvegarderSession(r))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<any>(API_URLS.register, request).pipe(
      switchMap(() =>
        this.login({ email: request.email, motDePasse: request.motDePasse })
      )
    );
  }

  getMe(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(API_URLS.me);
  }

  logout(): void {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    this.userStateSubject.next({ isLoggedIn: false, user: null });
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.token);
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.token);
  }

  getUserRole(): string | null {
    return localStorage.getItem(STORAGE_KEYS.role);
  }

  getUserId(): number | null {
    const id = localStorage.getItem(STORAGE_KEYS.userId);
    return id ? +id : null;
  }

  getSousCompteurId(): number | null {
    const id = localStorage.getItem(STORAGE_KEYS.sousCompteurId);
    return id ? +id : null;
  }

  getNomComplet(): string {
    return localStorage.getItem(STORAGE_KEYS.nomComplet) ?? 'Utilisateur';
  }

  getCurrentUserState(): UserState {
    return this.userStateSubject.getValue();
  }

  private sauvegarderSession(r: AuthResponse): void {
    localStorage.setItem(STORAGE_KEYS.token,      r.token ?? '');
    localStorage.setItem(STORAGE_KEYS.role,       r.role  ?? '');
    localStorage.setItem(STORAGE_KEYS.nomComplet, r.nomComplet ?? '');
    localStorage.setItem(STORAGE_KEYS.userId,     String(r.userId ?? 0));
    if (r.sousCompteurId) {
      localStorage.setItem(STORAGE_KEYS.sousCompteurId, String(r.sousCompteurId));
    }

    this.userStateSubject.next({ isLoggedIn: true, user: r });
  }

  private restaurerSession(): void {
    const token = localStorage.getItem(STORAGE_KEYS.token);
    const role  = localStorage.getItem(STORAGE_KEYS.role);

    if (token && role) {
      this.userStateSubject.next({
        isLoggedIn: true,
        user: {
          token,
          role,
          nomComplet: localStorage.getItem(STORAGE_KEYS.nomComplet) ?? '',
          userId:     +(localStorage.getItem(STORAGE_KEYS.userId) ?? 0)
        }
      });
    }
  }
}
