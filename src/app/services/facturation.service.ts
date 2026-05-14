import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_URLS } from '../config/app.config.api';
import { ApiResponse } from '../models/api-response.model';

export interface RepartitionItem {
  locataireNom:    string;
  reference:       string;
  consommation:    number;
  partPourcentage: number;
  montant:         number;
  statut:          'GENEREE' | 'EN_ATTENTE';
  factureId?:      number;
}

export interface RepartitionResponse {
  mois:                       number;
  annee:                      number;
  consommationTotaleMaison:   number;
  montantFacturePrincipale:   number;
  items:                      RepartitionItem[];
  facturesGenerees:           number;
  totalLocataires:            number;
}

export interface GenererFacturesRequest {
  maisonId:                 number;
  mois:                     number;
  annee:                    number;
  montantFacturePrincipale: number;
  locatairesIds:            number[];
}

@Injectable({ providedIn: 'root' })
export class FacturationService {
  private http = inject(HttpClient);

  getApercu(maisonId: number, mois: number, annee: number, montant: number): Observable<RepartitionResponse> {
    return this.http.get<ApiResponse<RepartitionResponse>>(
      API_URLS.repartitionApercu(maisonId, mois, annee, montant)
    ).pipe(map(r => r.data));
  }

  getFacturesMaison(maisonId: number, mois: number, annee: number): Observable<RepartitionResponse> {
    return this.http.get<ApiResponse<RepartitionResponse>>(
      API_URLS.repartitionMaison(maisonId, mois, annee)
    ).pipe(map(r => r.data));
  }

  genererFactures(req: GenererFacturesRequest): Observable<RepartitionResponse> {
    return this.http.post<ApiResponse<RepartitionResponse>>(API_URLS.repartitionGenerer, req).pipe(
      map(r => r.data)
    );
  }
}
