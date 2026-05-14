import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_URLS } from '../config/app.config.api';
import { MaisonRequest, MaisonResponse } from '../models/maison.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class MaisonService {
  private http = inject(HttpClient);

  createMaison(request: MaisonRequest): Observable<MaisonResponse> {
    return this.http.post<ApiResponse<MaisonResponse>>(API_URLS.maisons, request).pipe(
      map(r => r?.data)
    );
  }

  getMaisons(): Observable<MaisonResponse[]> {
    return this.http.get<ApiResponse<MaisonResponse[]>>(API_URLS.maisons).pipe(
      map(r => r.data)
    );
  }

  getMaison(id: number): Observable<MaisonResponse> {
    return this.http.get<ApiResponse<MaisonResponse>>(API_URLS.maison(id)).pipe(
      map(r => r.data)
    );
  }
}
