// ✅ CRÉÉ — bluetooth.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URLS } from '../config/app.config.api';

export interface ModuleStatus {
  deviceCode:  string;
  connecte:    boolean;
  signalForce: number;
  firmware:    string;
}

export interface ScanRequest {
  adresseBluetooth: string;
  compteurId:       number;
}

export interface ConfigRequest {
  adresseBluetooth: string;
  ssid:             string;
  motDePasseWifi:   string;
  compteurId:       number;
}

export interface DirectConfigRequest extends ConfigRequest {
  tensionNominale?: number;
  courantMax?:      number;
}

@Injectable({ providedIn: 'root' })
export class BluetoothService {

  private http = inject(HttpClient);

  scanModule(data: ScanRequest): Observable<any> {
    return this.http.post(API_URLS.bluetoothScan, data);
  }

  configureModule(data: ConfigRequest): Observable<any> {
    return this.http.post(API_URLS.bluetoothConfig, data);
  }

  directConfigure(data: DirectConfigRequest): Observable<any> {
    return this.http.post(API_URLS.bluetoothDirect, data);
  }

  getStatutModule(deviceCode: string): Observable<ModuleStatus> {
    return this.http.get<ModuleStatus>(API_URLS.moduleStatus(deviceCode));
  }
}
