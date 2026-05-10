// ✅ CRÉÉ — profil.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { ToastComponent } from '../../shared/toast/toast.component';

import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

import { UserProfile } from '../../models/user.model';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    SidebarComponent, HeaderComponent,
    LoadingSpinnerComponent, ToastComponent
  ],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss'
})
export class ProfilComponent implements OnInit {

  private userService  = inject(UserService);
  private toast        = inject(ToastService);
  private authService  = inject(AuthService);
  private fb           = inject(FormBuilder);

  profil?: UserProfile;
  isLoading = true;

  infosForm!:       FormGroup;
  seuilsForm!:      FormGroup;
  notifPushForm!:   FormGroup;

  isSavingInfos  = false;
  isSavingSeuils = false;
  isSavingNotifs = false;

  notifPush  = false;
  notifSms   = false;
  notifEmail = false;

  ngOnInit(): void {
    this.infosForm = this.fb.group({
      nom:       ['', [Validators.required, Validators.minLength(2)]],
      prenom:    ['', [Validators.required, Validators.minLength(2)]],
      email:     ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required]]
    });

    this.seuilsForm = this.fb.group({
      seuilCredit:   [20, [Validators.required, Validators.min(0), Validators.max(100)]],
      seuilAnomalie: [50, [Validators.required, Validators.min(0)]]
    });

    this.chargerProfil();
  }

  chargerProfil(): void {
    this.isLoading = true;
    this.userService.getProfil().subscribe({
      next: (p) => {
        this.profil = p;
        this.infosForm.patchValue({
          nom:       p.nom,
          prenom:    p.prenom,
          email:     p.email,
          telephone: p.telephone
        });
        this.seuilsForm.patchValue({
          seuilCredit:   p.seuilAlerteCredit,
          seuilAnomalie: p.seuilAlerteAnomalie
        });
        this.notifPush  = p.notificationPush;
        this.notifSms   = p.notificationSms;
        this.notifEmail = p.notificationEmail;
        this.isLoading  = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  get fi() { return this.infosForm.controls; }
  get fs() { return this.seuilsForm.controls; }

  sauvegarderInfos(): void {
    if (this.infosForm.invalid) { this.infosForm.markAllAsTouched(); return; }
    // Le backend n'a pas de PUT /users/profile selon la doc
    // On affiche le toast de succès (à adapter si endpoint disponible)
    this.toast.info('Modification du profil : fonctionnalité à venir.');
  }

  sauvegarderSeuils(): void {
    if (this.seuilsForm.invalid) { this.seuilsForm.markAllAsTouched(); return; }

    this.isSavingSeuils = true;
    this.userService.updateSeuils(
      this.seuilsForm.value.seuilCredit,
      this.seuilsForm.value.seuilAnomalie
    ).subscribe({
      next: () => {
        this.toast.success('Seuils d\'alerte mis à jour !');
        this.isSavingSeuils = false;
      },
      error: (err) => {
        this.toast.error(err.message);
        this.isSavingSeuils = false;
      }
    });
  }

  sauvegarderNotifs(): void {
    this.isSavingNotifs = true;
    this.userService.updateNotifPrefs(this.notifPush, this.notifSms, this.notifEmail).subscribe({
      next: () => {
        this.toast.success('Préférences de notification mises à jour !');
        this.isSavingNotifs = false;
      },
      error: (err) => {
        this.toast.error(err.message);
        this.isSavingNotifs = false;
      }
    });
  }

  deconnecter(): void {
    this.authService.logout();
  }

  getInitiales(): string {
    if (!this.profil) return 'U';
    return ((this.profil.prenom?.[0] ?? '') + (this.profil.nom?.[0] ?? '')).toUpperCase();
  }
}
