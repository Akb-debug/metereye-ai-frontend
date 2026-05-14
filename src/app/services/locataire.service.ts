import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_URLS } from '../config/app.config.api';
import { ApiResponse } from '../models/api-response.model';
import { SousCompteurResponse } from '../models/sous-compteur.model';

export interface CreerLocataireRequest {
  nom:               string;
  prenom:            string;
  email:             string;
  telephone:         string;
  sousCompteurId:    number;
  motDePasseTemporaire?: string;
}

@Injectable({ providedIn: 'root' })
export class LocataireService {
  private http = inject(HttpClient);

  getLocatairesByMaison(maisonId: number): Observable<SousCompteurResponse[]> {
    return this.http.get<ApiResponse<SousCompteurResponse[]>>(API_URLS.locatairesMaison(maisonId)).pipe(
      map(r => r.data)
    );
  }

  creerLocataire(req: CreerLocataireRequest): Observable<any> {
    return this.http.post<ApiResponse<any>>(API_URLS.creerLocataire, req).pipe(
      map(r => r.data)
    );
  }

  desactiverLocataire(locataireId: number): Observable<any> {
    return this.http.delete(API_URLS.desactiverLocataire(locataireId));
  }
}
