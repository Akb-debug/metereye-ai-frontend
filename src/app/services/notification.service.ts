// ✅ CRÉÉ — notification.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationResponse, NotificationPreferences } from '../models/alerte.model';
import { API_URLS } from '../config/app.config.api';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private http = inject(HttpClient);

  getNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(API_URLS.notifications);
  }

  getPreferences(): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(API_URLS.notifPreferences);
  }

  updatePreferences(data: NotificationPreferences): Observable<NotificationPreferences> {
    return this.http.put<NotificationPreferences>(API_URLS.notifPreferences, data);
  }
}
