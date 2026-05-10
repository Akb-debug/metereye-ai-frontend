// 🔄 MODIFIÉ — app.routes.ts — routes complètes profil PERSONNEL avec lazy loading

import { Routes } from '@angular/router';
import { authGuard, redirectIfLoggedInGuard } from './guards/auth.guard';

export const routes: Routes = [

  // ── Landing page ────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'MeterEye AI — Gestion de compteurs électriques'
  },

  // ── Auth ────────────────────────────────────────
  {
    path: 'auth/login',
    canActivate: [redirectIfLoggedInGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'Connexion — MeterEye AI'
  },
  {
    path: 'auth/register',
    canActivate: [redirectIfLoggedInGuard],
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    title: 'Inscription — MeterEye AI'
  },

  // ── Onboarding ──────────────────────────────────
  {
    path: 'onboarding/compteur',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/onboarding/create-compteur/create-compteur.component').then(m => m.CreateCompteurComponent),
    title: 'Configurer votre compteur — MeterEye AI'
  },
  {
    path: 'onboarding/mode-lecture',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/onboarding/choose-mode/choose-mode.component').then(m => m.ChooseModeComponent),
    title: 'Mode de lecture — MeterEye AI'
  },
  {
    path: 'onboarding/config-esp32',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/onboarding/config-esp32/config-esp32.component').then(m => m.ConfigEsp32Component),
    title: 'Configuration ESP32-CAM — MeterEye AI'
  },
  {
    path: 'onboarding/config-pzem',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/onboarding/config-pzem/config-pzem.component').then(m => m.ConfigPzemComponent),
    title: 'Configuration PZEM-004T — MeterEye AI'
  },

  // ── Dashboards ──────────────────────────────────
  {
    path: 'dashboard/cashpower',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/cashpower/cashpower.component').then(m => m.CashpowerComponent),
    title: 'Tableau de bord Cash Power — MeterEye AI'
  },
  {
    path: 'dashboard/classique',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/classique/classique.component').then(m => m.ClassiqueComponent),
    title: 'Tableau de bord Classique — MeterEye AI'
  },

  // ── Pages secondaires ───────────────────────────
  {
    path: 'historique',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/historique/historique.component').then(m => m.HistoriqueComponent),
    title: 'Historique des relevés — MeterEye AI'
  },
  {
    path: 'alertes',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/alertes/alertes.component').then(m => m.AlertesComponent),
    title: 'Alertes — MeterEye AI'
  },
  {
    path: 'profil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profil/profil.component').then(m => m.ProfilComponent),
    title: 'Mon profil — MeterEye AI'
  },

  // ── Redirect + wildcard ─────────────────────────
  { path: 'login',    redirectTo: 'auth/login',    pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },
  { path: '**',       redirectTo: '' }
];
