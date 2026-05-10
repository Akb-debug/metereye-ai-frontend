// ✅ CRÉÉ — user.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from '../models/user.model';
import { API_URLS } from '../config/app.config.api';

@Injectable({ providedIn: 'root' })
export class UserService {

  private http = inject(HttpClient);

  getProfil(): Observable<UserProfile> {
    return this.http.get<UserProfile>(API_URLS.profil);
  }

  updateSeuils(seuilCredit: number, seuilAnomalie: number): Observable<any> {
    return this.http.put(API_URLS.updateSeuils, { seuilCredit, seuilAnomalie });
  }

  updateNotifPrefs(push: boolean, sms: boolean, email: boolean): Observable<any> {
    return this.http.put(API_URLS.updateNotifs, { push, sms, email });
  }
}
