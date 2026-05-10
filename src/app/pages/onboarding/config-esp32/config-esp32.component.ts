// ✅ CRÉÉ — config-esp32.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BluetoothService } from '../../../services/bluetooth.service';
import { CompteurService } from '../../../services/compteur.service';
import { ToastService } from '../../../services/toast.service';
import { ToastComponent } from '../../../shared/toast/toast.component';
import { STORAGE_KEYS } from '../../../config/app.config.api';

@Component({
  selector: 'app-config-esp32',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ToastComponent],
  templateUrl: './config-esp32.component.html',
  styleUrl: './config-esp32.component.scss'
})
export class ConfigEsp32Component implements OnInit {

  private fb               = inject(FormBuilder);
  private bluetoothService = inject(BluetoothService);
  private compteurService  = inject(CompteurService);
  private router           = inject(Router);
  private toast            = inject(ToastService);

  scanForm!:   FormGroup;
  wifiForm!:   FormGroup;

  isScanning   = false;
  isConfiguring = false;
  scanReussi   = false;
  errorMessage = '';

  ngOnInit(): void {
    this.scanForm = this.fb.group({
      adresseBluetooth: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.wifiForm = this.fb.group({
      ssid:           ['', [Validators.required]],
      motDePasseWifi: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get sf() { return this.scanForm.controls; }
  get wf() { return this.wifiForm.controls; }

  scanner(): void {
    if (this.scanForm.invalid) { this.scanForm.markAllAsTouched(); return; }

    const compteurId = this.compteurService.getCompteurIdSauvegarde();
    if (!compteurId) { this.toast.error('Compteur introuvable.'); return; }

    this.isScanning   = true;
    this.errorMessage = '';

    this.bluetoothService.scanModule({
      adresseBluetooth: this.scanForm.value.adresseBluetooth,
      compteurId
    }).subscribe({
      next: () => {
        this.scanReussi = true;
        this.isScanning = false;
        this.toast.success('Module ESP32-CAM détecté !');
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isScanning = false;
      }
    });
  }

  configurer(): void {
    if (this.wifiForm.invalid) { this.wifiForm.markAllAsTouched(); return; }

    const compteurId = this.compteurService.getCompteurIdSauvegarde();
    if (!compteurId) { this.toast.error('Compteur introuvable.'); return; }

    this.isConfiguring = true;
    this.errorMessage  = '';

    this.bluetoothService.configureModule({
      adresseBluetooth: this.scanForm.value.adresseBluetooth,
      ssid:             this.wifiForm.value.ssid,
      motDePasseWifi:   this.wifiForm.value.motDePasseWifi,
      compteurId
    }).subscribe({
      next: () => {
        this.toast.success('Module ESP32-CAM configuré avec succès !');
        this.redirectDashboard();
      },
      error: (err) => {
        this.errorMessage  = err.message;
        this.isConfiguring = false;
      }
    });
  }

  private redirectDashboard(): void {
    const type = localStorage.getItem(STORAGE_KEYS.typeCompteur);
    setTimeout(() => {
      if (type === 'CASH_POWER') {
        this.router.navigate(['/dashboard/cashpower']);
      } else {
        this.router.navigate(['/dashboard/classique']);
      }
    }, 800);
  }
}
