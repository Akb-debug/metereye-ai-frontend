// 🔄 MODIFIÉ — config-esp32.component.ts — corrections: Bluetooth remplacé par DeviceService (QR code)

import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../../../services/device.service';
import { CompteurService } from '../../../services/compteur.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ToastComponent } from '../../../shared/toast/toast.component';
import { DeviceResponse } from '../../../models/device.model';
import { STORAGE_KEYS } from '../../../config/app.config.api';

@Component({
  selector: 'app-config-esp32',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ToastComponent, RouterLink],
  templateUrl: './config-esp32.component.html',
  styleUrl: './config-esp32.component.scss'
})
export class ConfigEsp32Component implements OnInit {

  private fb              = inject(FormBuilder);
  private deviceService   = inject(DeviceService);
  private compteurService = inject(CompteurService);
  private authService     = inject(AuthService);
  private router          = inject(Router);
  private toast           = inject(ToastService);

  scanForm!:          FormGroup;
  associationForm!:   FormGroup;
  isScanning          = false;
  isAssociating       = false;
  deviceScanne?:      DeviceResponse;
  showAssociationForm = false;
  errorMessage        = '';

  intervalOptions = [
    { value: 900,  label: '15 minutes' },
    { value: 1800, label: '30 minutes' },
    { value: 3600, label: '1 heure' },
    { value: 7200, label: '2 heures' },
  ];

  get nomComplet(): string { return this.authService.getNomComplet(); }

  ngOnInit(): void {
    this.scanForm = this.fb.group({
      deviceCode:   ['', [Validators.required, Validators.minLength(3)]],
      serialNumber: ['', [Validators.required, Validators.minLength(3)]],
      qrCodeValue:  ['']
    });
    this.associationForm = this.fb.group({
      captureInterval: [3600, Validators.required]
    });
  }

  get sf() { return this.scanForm.controls; }

  scanner(): void {
    if (this.scanForm.invalid) { this.scanForm.markAllAsTouched(); return; }
    const compteurId = this.compteurService.getCompteurIdSauvegarde();
    if (!compteurId) { this.toast.error('Compteur introuvable.'); return; }

    this.isScanning   = true;
    this.errorMessage = '';

    this.deviceService.scanDevice({
      deviceCode:   this.scanForm.value.deviceCode,
      serialNumber: this.scanForm.value.serialNumber,
      qrCodeValue:  this.scanForm.value.qrCodeValue ?? ''
    }).subscribe({
      next: (device) => {
        this.deviceScanne       = device;
        this.showAssociationForm = true;
        this.isScanning         = false;
        this.toast.success('Module ESP32-CAM détecté !');
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
        this.isScanning   = false;
      }
    });
  }

  associer(): void {
    const compteurId = this.compteurService.getCompteurIdSauvegarde();
    if (!compteurId || !this.deviceScanne) return;

    this.isAssociating = true;
    this.errorMessage  = '';

    this.deviceService.associerDevice(this.deviceScanne.deviceCode, {
      compteurId,
      captureInterval: this.associationForm.value.captureInterval
    }).subscribe({
      next: () => {
        this.isAssociating = false;
        this.toast.success('Module ESP32-CAM associé avec succès !');
        this.redirectDashboard();
      },
      error: (err: Error) => {
        this.errorMessage  = err.message;
        this.isAssociating = false;
      }
    });
  }

  seDeconnecter(): void { this.authService.logout(); }

  private redirectDashboard(): void {
    const type = localStorage.getItem(STORAGE_KEYS.typeCompteur);
    this.router.navigate(
      type === 'CASH_POWER' ? ['/dashboard/cashpower'] : ['/dashboard/classique']
    );
  }
}
