import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_URLS } from '../config/app.config.api';
import { ApiResponse } from '../models/api-response.model';
import { SousCompteurResponse } from '../models/sous-compteur.model';

export interface SousCompteurRequest {
  reference:           string;
  descriptionLogement: string;
  valeurInitiale:      number;
  maisonId:            number;
}

@Injectable({ providedIn: 'root' })
export class SousCompteurService {
  private http = inject(HttpClient);

  getSousCompteurs(maisonId: number): Observable<SousCompteurResponse[]> {
    return this.http.get<ApiResponse<SousCompteurResponse[]>>(
      `${API_URLS.sousCompteurs}/maison/${maisonId}`
    ).pipe(map(r => r.data));
  }

  getSousCompteursLibres(maisonId: number): Observable<SousCompteurResponse[]> {
    return this.getSousCompteurs(maisonId).pipe(
      map(list => list.filter(sc => !sc.locataireId))
    );
  }

  creerSousCompteur(req: SousCompteurRequest): Observable<SousCompteurResponse> {
    return this.http.post<ApiResponse<SousCompteurResponse>>(API_URLS.sousCompteurs, req).pipe(
      map(r => r.data)
    );
  }
}
