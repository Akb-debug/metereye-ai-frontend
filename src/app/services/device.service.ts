// ✅ CRÉÉ — device.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeviceScanRequest, DeviceAssociateRequest, DeviceResponse } from '../models/device.model';
import { API_URLS } from '../config/app.config.api';

@Injectable({ providedIn: 'root' })
export class DeviceService {

  private http = inject(HttpClient);

  scanDevice(data: DeviceScanRequest): Observable<DeviceResponse> {
    return this.http.post<DeviceResponse>(API_URLS.deviceScan, data);
  }

  associerDevice(deviceCode: string, data: DeviceAssociateRequest): Observable<DeviceResponse> {
    return this.http.post<DeviceResponse>(API_URLS.deviceAssociate(deviceCode), data);
  }

  getStatut(deviceCode: string): Observable<DeviceResponse> {
    return this.http.get<DeviceResponse>(API_URLS.deviceStatus(deviceCode));
  }

  getMesDevices(): Observable<DeviceResponse[]> {
    return this.http.get<DeviceResponse[]>(API_URLS.myDevices);
  }
}
