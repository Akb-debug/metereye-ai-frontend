// 🔄 MODIFIÉ — user.service.ts — corrections: getProfil unwrap .data, updateSeuils/Notifs via query params

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserProfile } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { API_URLS } from '../config/app.config.api';

@Injectable({ providedIn: 'root' })
export class UserService {

  private http = inject(HttpClient);

  getProfil(): Observable<UserProfile> {
    return this.http.get<ApiResponse<UserProfile>>(API_URLS.profil)
      .pipe(map(r => r.data));
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
}
