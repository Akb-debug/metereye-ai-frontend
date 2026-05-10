// Rôle : Tableau de bord pour les locataires.
// Affiche la consommation et les montants à payer.

import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-locataire',
  standalone: true,
  template: `
    <!-- A) NAVBAR -->
    <nav class="navbar">
      <div class="nav-brand">MeterEye AI</div>
      <div class="nav-center">
        <span class="user-name">{{ nomComplet }}</span>
        <span class="badge-role">Locataire</span>
      </div>
      <button class="btn-logout" (click)="seDeconnecter()">Déconnexion</button>
    </nav>

    <!-- B) CONTENU -->
    <main class="dashboard-content">
      <h1 class="page-title">Tableau de bord Locataire</h1>
      <p class="text-muted">Les données s'afficheront ici prochainement.</p>

      <div class="cards-grid">
        <div class="card">
          <div class="card-value">—</div>
          <div class="card-label">Ma consommation</div>
        </div>
        <div class="card">
          <div class="card-value">—</div>
          <div class="card-label">Montant à payer</div>
        </div>
        <div class="card">
          <div class="card-value">—</div>
          <div class="card-label">Dernière alerte</div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f9fafb;
      min-height: 100vh;
    }
    
    /* Navbar */
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #15803d;
      color: white;
      height: 60px;
      padding: 0 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .nav-brand {
      font-weight: bold;
      font-size: 1.25rem;
    }
    .nav-center {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .user-name {
      font-weight: 500;
    }
    .badge-role {
      background-color: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .btn-logout {
      background: transparent;
      border: 1px solid white;
      color: white;
      padding: 0.35rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    .btn-logout:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    /* Contenu */
    .dashboard-content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .page-title {
      font-size: 1.5rem;
      color: #111827;
      margin-top: 0;
      margin-bottom: 0.5rem;
    }
    .text-muted {
      color: #6b7280;
      margin-bottom: 2rem;
    }

    /* Grille de cartes */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    @media (min-width: 768px) {
      .cards-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    /* Carte */
    .card {
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .card-value {
      font-size: 28px;
      font-weight: bold;
      color: #16a34a;
      margin-bottom: 0.5rem;
    }
    .card-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `]
})
export class LocataireComponent {
  private authService = inject(AuthService);
  
  nomComplet = this.authService.getNomComplet() || 'Utilisateur';

  seDeconnecter(): void {
    this.authService.logout();
  }
}
