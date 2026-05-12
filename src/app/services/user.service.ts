import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserProfile, ChangePasswordRequest, NotificationPreferences } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { API_URLS } from '../config/app.config.api';

@Injectable({ providedIn: 'root' })
export class UserService {

  private http = inject(HttpClient);

  getProfil(): Observable<UserProfile> {
    return this.http.get<any>(API_URLS.profil).pipe(
      map(r => (r?.data !== undefined ? r.data : r) as UserProfile)
    );
  }

  updateProfil(data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<any>(API_URLS.profil, data).pipe(
      map(r => (r?.data !== undefined ? r.data : r) as UserProfile)
    );
  }

  changePassword(req: ChangePasswordRequest): Observable<any> {
    return this.http.put(API_URLS.changePassword, req);
  }

  updateSeuils(seuilCredit: number, seuilAnomalie: number): Observable<any> {
    return this.http.put(
      `${API_URLS.updateSeuils}?seuilCredit=${seuilCredit}&seuilAnomalie=${seuilAnomalie}`,
      {}
    );
  }

  updateNotifPrefs(push: boolean, sms: boolean, email: boolean): Observable<any> {
    return this.http.put(
      `${API_URLS.updateNotifs}?push=${push}&sms=${sms}&email=${email}`,
      {}
    );
  }

  getNotifPreferences(): Observable<NotificationPreferences> {
    return this.http.get<any>(API_URLS.notifPreferences).pipe(
      map(r => (r?.data !== undefined ? r.data : r) as NotificationPreferences)
    );
  }

  updateNotifPreferences(prefs: NotificationPreferences): Observable<any> {
    return this.http.put(API_URLS.notifPreferences, prefs);
  }
}
