// 🔄 MODIFIÉ — compteur.service.ts — corrections: ApiResponse.data unwrapping sur toutes les réponses wrappées

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CompteurRequest, CompteurResponse, StatutConfig, StatsResponse, ModeLecture } from '../models/compteur.model';
import { ApiResponse } from '../models/api-response.model';
import { API_URLS, STORAGE_KEYS } from '../config/app.config.api';

@Injectable({ providedIn: 'root' })
export class CompteurService {

  private http = inject(HttpClient);

  createCompteur(data: CompteurRequest): Observable<CompteurResponse> {
    return this.http.post<ApiResponse<CompteurResponse>>(API_URLS.compteurs, data)
      .pipe(map(r => r.data));
  }

  getMesCompteurs(): Observable<CompteurResponse[]> {
    return this.http.get<ApiResponse<CompteurResponse[]>>(API_URLS.compteurs)
      .pipe(map(r => r.data));
  }

  getCompteur(id: number): Observable<CompteurResponse> {
    return this.http.get<ApiResponse<CompteurResponse>>(API_URLS.compteur(id))
      .pipe(map(r => r.data));
  }

  getStats(id: number, periode: string): Observable<StatsResponse> {
    return this.http.get<ApiResponse<StatsResponse>>(API_URLS.stats(id, periode))
      .pipe(map(r => r.data));
  }

  setModeLecture(id: number, mode: ModeLecture, commentaire?: string): Observable<any> {
    const body: any = { modeLecture: mode };
    if (commentaire) body.commentaire = commentaire;
    return this.http.post(API_URLS.modeLecture(id), body);
  }

  getStatutConfig(id: number): Observable<StatutConfig> {
    return this.http.get<StatutConfig>(API_URLS.statutConfig(id));
  }

  addReleveManuel(data: { compteurId: number; valeur: number }): Observable<any> {
    return this.http.post(API_URLS.releveManuel, data);
  }

  recharger(data: { compteurId: number; montant: number; codeRecharge: string }): Observable<any> {
    return this.http.post(API_URLS.recharge, data);
  }

  sauvegarderCompteurId(id: number): void {
    localStorage.setItem(STORAGE_KEYS.compteurId, id.toString());
  }

  getCompteurIdSauvegarde(): number | null {
    const raw = localStorage.getItem(STORAGE_KEYS.compteurId);
    if (raw === null) return null;
    const id = parseInt(raw, 10);
    return id > 0 ? id : null;
  }

  sauvegarderTypeCompteur(type: string): void {
    localStorage.setItem(STORAGE_KEYS.typeCompteur, type);
  }

  getTypeCompteurSauvegarde(): string | null {
    return localStorage.getItem(STORAGE_KEYS.typeCompteur);
  }
}
