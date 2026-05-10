import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

// Importation différée pour éviter d'importer des fichiers qui n'existent pas encore
// Mais vu qu'ils seront créés juste après, on peut les importer normalement
import { HomeComponent }          from './pages/home/home.component';
import { LoginComponent }         from './pages/login/login.component';
import { RegisterComponent }      from './pages/register/register.component';
import { ProprietaireComponent }  from './pages/dashboard/proprietaire/proprietaire.component';
import { LocataireComponent }     from './pages/dashboard/locataire/locataire.component';
import { CashpowerComponent }     from './pages/dashboard/cashpower/cashpower.component';
import { ClassiqueComponent }     from './pages/dashboard/classique/classique.component';
import { AdminComponent }         from './pages/dashboard/admin/admin.component';

export const routes: Routes = [

  // ── Routes publiques (sans token) ──────────────────
  { path: '',         component: HomeComponent,     title: 'MeterEye AI' },
  { path: 'login',    component: LoginComponent,    title: 'Connexion' },
  { path: 'register', component: RegisterComponent, title: 'Inscription' },

  // ── Routes privées (token obligatoire via authGuard) ──
  {
    path: 'dashboard/proprietaire',
    component: ProprietaireComponent,
    canActivate: [authGuard],
    title: 'Tableau de bord Propriétaire'
  },
  {
    path: 'dashboard/locataire',
    component: LocataireComponent,
    canActivate: [authGuard],
    title: 'Tableau de bord Locataire'
  },
  {
    path: 'dashboard/cashpower',
    component: CashpowerComponent,
    canActivate: [authGuard],
    title: 'Tableau de bord Cash Power'
  },
  {
    path: 'dashboard/classique',
    component: ClassiqueComponent,
    canActivate: [authGuard],
    title: 'Tableau de bord Classique'
  },
  {
    path: 'dashboard/admin',
    component: AdminComponent,
    canActivate: [authGuard],
    title: 'Administration'
  },

  // ── Route inconnue → accueil ────────────────────────
  { path: '**', redirectTo: '' }
];

