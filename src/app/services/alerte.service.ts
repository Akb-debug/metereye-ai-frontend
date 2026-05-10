// ✅ CRÉÉ — alerte.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlerteResponse } from '../models/alerte.model';
import { API_URLS } from '../config/app.config.api';

@Injectable({ providedIn: 'root' })
export class AlerteService {

  private http = inject(HttpClient);

  getAlertes(): Observable<AlerteResponse[]> {
    return this.http.get<AlerteResponse[]>(API_URLS.alertes);
  }

  getAlertesNonLues(): Observable<AlerteResponse[]> {
    return this.http.get<AlerteResponse[]>(API_URLS.alertesNonLues);
  }

  marquerLue(id: number): Observable<void> {
    return this.http.patch<void>(API_URLS.alerteLue(id), {});
  }

  marquerToutLu(): Observable<void> {
    return this.http.patch<void>(API_URLS.alertesToutLu, {});
  }
}
