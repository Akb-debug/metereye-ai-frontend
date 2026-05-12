import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormsModule, FormBuilder, FormGroup,
  Validators, ValidatorFn, AbstractControl
} from '@angular/forms';

import { SidebarComponent }        from '../../shared/sidebar/sidebar.component';
import { HeaderComponent }         from '../../shared/header/header.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { ToastComponent }          from '../../shared/toast/toast.component';

import { UserService }     from '../../services/user.service';
import { CompteurService } from '../../services/compteur.service';
import { ToastService }    from '../../services/toast.service';
import { AuthService }     from '../../services/auth.service';

import { UserProfile, NotificationPreferences } from '../../models/user.model';
import { CompteurResponse } from '../../models/compteur.model';

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

  private userService     = inject(UserService);
  private compteurService = inject(CompteurService);
  private toast           = inject(ToastService);
  private authService     = inject(AuthService);
  private fb              = inject(FormBuilder);

  profil?:   UserProfile;
  compteurs: CompteurResponse[] = [];
  isLoading = true;

  activeSection = 'informations';

  infosForm!:  FormGroup;
  mdpForm!:    FormGroup;
  seuilsForm!: FormGroup;

  isSavingInfos  = false;
  isSavingMdp    = false;
  isSavingSeuils = false;
  isSavingNotifs = false;

  notifPush     = false;
  notifSms      = false;
  notifEmail    = false;
  alertCredit   = true;
  alertAnomalie = true;
  alertSysteme  = true;

  readonly navItems = [
    { id: 'informations',  label: 'Informations' },
    { id: 'securite',      label: 'Sécurité' },
    { id: 'seuils',        label: 'Seuils d\'alerte' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'mes-compteurs', label: 'Mes compteurs' },
    { id: 'langue',        label: 'Langue & région' },
  ];

  ngOnInit(): void {
    this.infosForm = this.fb.group({
      nomComplet: ['', [Validators.required, Validators.minLength(2)]],
      email:      ['', [Validators.required, Validators.email]],
      telephone:  ['']
    });

    this.mdpForm = this.fb.group({
      ancienMotDePasse:    ['', Validators.required],
      nouveauMotDePasse:   ['', [Validators.required, Validators.minLength(8), Validators.pattern(/\d/)]],
      confirmerMotDePasse: ['', Validators.required]
    }, { validators: this.mdpMatchValidator() });

    this.seuilsForm = this.fb.group({
      seuilCredit:   [50, [Validators.required, Validators.min(0)]],
      seuilAnomalie: [20, [Validators.required, Validators.min(0), Validators.max(200)]]
    });

    this.charger();
  }

  private charger(): void {
    this.isLoading = true;
    this.userService.getProfil().subscribe({
      next: (p) => {
        this.profil = p;
        const tel = (p.telephone ?? '').replace(/^\+228/, '').trim();
        this.infosForm.patchValue({
          nomComplet: p.nomComplet ?? '',
          email:      p.email     ?? '',
          telephone:  tel
        });
        this.seuilsForm.patchValue({
          seuilCredit:   p.seuilAlerteCredit   ?? 50,
          seuilAnomalie: p.seuilAlerteAnomalie ?? 20
        });
        this.notifPush  = p.notificationPush  ?? false;
        this.notifSms   = p.notificationSms   ?? false;
        this.notifEmail = p.notificationEmail ?? false;
        this.isLoading  = false;
      },
      error: () => { this.isLoading = false; }
    });

    this.compteurService.getMesCompteurs().subscribe({
      next: (c) => { this.compteurs = c; },
      error: () => {}
    });

    this.userService.getNotifPreferences().subscribe({
      next: (prefs) => {
        this.alertCredit   = prefs.creditAlerts;
        this.alertAnomalie = prefs.anomalyAlerts;
        this.alertSysteme  = prefs.systemAlerts;
      },
      error: () => {}
    });
  }

  private mdpMatchValidator(): ValidatorFn {
    return (group: AbstractControl) => {
      const n = group.get('nouveauMotDePasse')?.value;
      const c = group.get('confirmerMotDePasse')?.value;
      return n === c ? null : { mdpMismatch: true };
    };
  }

  scrollTo(id: string): void {
    this.activeSection = id;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  get fi() { return this.infosForm.controls; }
  get fm() { return this.mdpForm.controls; }
  get fs() { return this.seuilsForm.controls; }

  getInitiales(): string {
    const parts = (this.profil?.nomComplet ?? '').trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (parts[0]?.[0] ?? '?').toUpperCase();
  }

  get roleLabel(): string {
    switch (this.profil?.role) {
      case 'PERSONNEL':  return 'Particulier';
      case 'ROLE_USER':  return 'Particulier';
      case 'ROLE_ADMIN': return 'Administrateur';
      case 'ROLE_TECH':  return 'Technicien';
      default:           return (this.profil?.role ?? '').replace('ROLE_', '');
    }
  }

  sauvegarderInfos(): void {
    if (this.infosForm.invalid) { this.infosForm.markAllAsTouched(); return; }
    this.isSavingInfos = true;
    this.userService.updateProfil({
      nomComplet: this.infosForm.value.nomComplet,
      telephone:  '+228' + this.infosForm.value.telephone
    }).subscribe({
      next: (p) => {
        this.profil = p;
        this.toast.success('Informations mises à jour !');
        this.isSavingInfos = false;
      },
      error: () => {
        this.toast.error('Mise à jour indisponible.');
        this.isSavingInfos = false;
      }
    });
  }

  changerMotDePasse(): void {
    this.mdpForm.markAllAsTouched();
    if (this.mdpForm.invalid) return;
    this.isSavingMdp = true;
    this.userService.changePassword({
      ancienMotDePasse:  this.mdpForm.value.ancienMotDePasse,
      nouveauMotDePasse: this.mdpForm.value.nouveauMotDePasse
    }).subscribe({
      next: () => {
        this.toast.success('Mot de passe modifié !');
        this.mdpForm.reset();
        this.isSavingMdp = false;
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? 'Mot de passe actuel incorrect.');
        this.isSavingMdp = false;
      }
    });
  }

  sauvegarderSeuils(): void {
    if (this.seuilsForm.invalid) { this.seuilsForm.markAllAsTouched(); return; }
    this.isSavingSeuils = true;
    this.userService.updateSeuils(
      this.seuilsForm.value.seuilCredit,
      this.seuilsForm.value.seuilAnomalie
    ).subscribe({
      next: () => { this.toast.success('Seuils d\'alerte mis à jour !'); this.isSavingSeuils = false; },
      error: () => { this.toast.error('Erreur lors de la sauvegarde.'); this.isSavingSeuils = false; }
    });
  }

  sauvegarderNotifs(): void {
    this.isSavingNotifs = true;

    this.userService.updateNotifPrefs(this.notifPush, this.notifSms, this.notifEmail).subscribe({
      next: () => { this.toast.success('Préférences mises à jour !'); this.isSavingNotifs = false; },
      error: () => { this.toast.error('Erreur lors de la sauvegarde.'); this.isSavingNotifs = false; }
    });

    const prefs: NotificationPreferences = {
      pushEnabled:   this.notifPush,
      emailEnabled:  this.notifEmail,
      smsEnabled:    this.notifSms,
      creditAlerts:  this.alertCredit,
      anomalyAlerts: this.alertAnomalie,
      systemAlerts:  this.alertSysteme
    };
    this.userService.updateNotifPreferences(prefs).subscribe({ next: () => {}, error: () => {} });
  }

  typeLabel(t: string): string {
    return t === 'CASH_POWER' ? 'Cash Power' : 'Classique';
  }

  deconnecter(): void {
    this.authService.logout();
  }
}
