// ✅ CRÉÉ — config-pzem.component.ts

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
  selector: 'app-config-pzem',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ToastComponent],
  templateUrl: './config-pzem.component.html',
  styleUrl: './config-pzem.component.scss'
})
export class ConfigPzemComponent implements OnInit {

  private fb               = inject(FormBuilder);
  private bluetoothService = inject(BluetoothService);
  private compteurService  = inject(CompteurService);
  private router           = inject(Router);
  private toast            = inject(ToastService);

  form!:        FormGroup;
  isScanning   = false;
  isConfiguring = false;
  scanReussi   = false;
  accordeonOuvert = false;
  errorMessage = '';

  ngOnInit(): void {
    this.form = this.fb.group({
      adresseBluetooth: ['', [Validators.required, Validators.minLength(3)]],
      ssid:             ['', [Validators.required]],
      motDePasseWifi:   ['', [Validators.required, Validators.minLength(8)]],
      tensionNominale:  [220],
      courantMax:       [63]
    });
  }

  get f() { return this.form.controls; }

  scanner(): void {
    if (this.form.get('adresseBluetooth')?.invalid) {
      this.form.get('adresseBluetooth')?.markAsTouched(); return;
    }

    const compteurId = this.compteurService.getCompteurIdSauvegarde();
    if (!compteurId) { this.toast.error('Compteur introuvable.'); return; }

    this.isScanning   = true;
    this.errorMessage = '';

    this.bluetoothService.scanModule({
      adresseBluetooth: this.form.value.adresseBluetooth,
      compteurId
    }).subscribe({
      next: () => {
        this.scanReussi = true;
        this.isScanning = false;
        this.toast.success('Module PZEM-004T détecté !');
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isScanning = false;
      }
    });
  }

  configurer(): void {
    const essentials = ['adresseBluetooth', 'ssid', 'motDePasseWifi'];
    essentials.forEach(k => this.form.get(k)?.markAsTouched());
    if (essentials.some(k => this.form.get(k)?.invalid)) return;

    const compteurId = this.compteurService.getCompteurIdSauvegarde();
    if (!compteurId) { this.toast.error('Compteur introuvable.'); return; }

    this.isConfiguring = true;
    this.errorMessage  = '';

    this.bluetoothService.directConfigure({
      adresseBluetooth: this.form.value.adresseBluetooth,
      ssid:             this.form.value.ssid,
      motDePasseWifi:   this.form.value.motDePasseWifi,
      compteurId,
      tensionNominale:  this.form.value.tensionNominale,
      courantMax:       this.form.value.courantMax
    }).subscribe({
      next: () => {
        this.toast.success('Module PZEM-004T configuré avec succès !');
        const type = localStorage.getItem(STORAGE_KEYS.typeCompteur);
        setTimeout(() => {
          this.router.navigate(type === 'CASH_POWER'
            ? ['/dashboard/cashpower']
            : ['/dashboard/classique']);
        }, 800);
      },
      error: (err) => {
        this.errorMessage  = err.message;
        this.isConfiguring = false;
      }
    });
  }
}
