// ✅ CRÉÉ — reading.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReadingResponse, CreateReadingRequest, PagedReadings } from '../models/reading.model';
import { API_URLS } from '../config/app.config.api';

@Injectable({ providedIn: 'root' })
export class ReadingService {

  private http = inject(HttpClient);

  createReleveManuel(data: CreateReadingRequest): Observable<ReadingResponse> {
    return this.http.post<ReadingResponse>(API_URLS.readingsManual, data);
  }

  getReleves(
    meterId: number,
    page: number = 0,
    size: number = 10,
    source?: string
  ): Observable<PagedReadings> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (source) { params = params.set('source', source); }

    return this.http.get<PagedReadings>(API_URLS.readingsByMeter(meterId), { params });
  }

  getDernierReleve(meterId: number): Observable<ReadingResponse> {
    return this.http.get<ReadingResponse>(API_URLS.latestReading(meterId));
  }
}
