// Rôle : Page d'accueil (Landing page) du projet MeterEye AI.
// Présente les fonctionnalités et redirige vers login ou register.

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- A) NAVBAR -->
    <nav class="navbar">
      <div class="nav-brand">
        MeterEye AI
      </div>
      <div class="nav-actions">
        <a routerLink="/login" class="btn btn-outline">Se connecter</a>
        <a routerLink="/register" class="btn btn-primary">Créer un compte</a>
      </div>
    </nav>

    <!-- B) HERO -->
    <section class="hero">
      <div class="hero-content">
        <span class="badge">Adapté au contexte togolais</span>
        <h1>Gérez vos compteurs électriques intelligemment</h1>
        <p>
          MeterEye AI automatise la lecture de vos compteurs Cash Power, Classique et Partagés grâce à l'IoT et l'IA.
        </p>
        <div class="hero-actions">
          <a routerLink="/register" class="btn btn-primary btn-large">Créer mon compte gratuitement</a>
          <a href="#features" class="btn btn-secondary btn-large">Voir les fonctionnalités</a>
        </div>
      </div>
    </section>

    <!-- C) SECTION FONCTIONNALITÉS -->
    <section id="features" class="features">
      <div class="cards-grid">
        <div class="card">
          <h3>Lecture automatique</h3>
          <p>L'ESP32-CAM photographie votre compteur et extrait la valeur via OCR. Relevés sans intervention humaine.</p>
        </div>
        <div class="card">
          <h3>Alertes intelligentes</h3>
          <p>Recevez une alerte avant que votre crédit Cash Power ne s'épuise. Fini les coupures à minuit.</p>
        </div>
        <div class="card">
          <h3>Compteurs partagés transparent</h3>
          <p>Répartition automatique des charges entre locataires. Chacun voit sa propre consommation. Fini les conflits.</p>
        </div>
      </div>
    </section>

    <!-- D) SECTION TYPES DE COMPTEURS -->
    <section class="compteurs">
      <h2>Compatible avec tous vos compteurs</h2>
      <div class="badges">
        <span class="badge-type cashpower">Cash Power</span>
        <span class="badge-type classique">Classique</span>
        <span class="badge-type partage">Partagé</span>
      </div>
    </section>

    <!-- E) CTA FINAL -->
    <section class="cta-final">
      <h2>Prêt à gérer votre électricité intelligemment ?</h2>
      <a routerLink="/register" class="btn btn-white btn-large">Commencer maintenant</a>
    </section>

    <!-- F) FOOTER -->
    <footer class="footer">
      <p>© 2026 MeterEye AI — ALLODE Kany Benjamin</p>
      <p>Licence Génie Logiciel — IPNET Institute of Technology — Togo</p>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1f2937;
    }

    /* Utilitaires */
    .btn {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s;
      cursor: pointer;
    }
    .btn-large {
      padding: 0.75rem 1.5rem;
      font-size: 1.1rem;
    }
    .btn-primary {
      background-color: #16a34a;
      color: white;
      border: 1px solid #16a34a;
    }
    .btn-primary:hover {
      background-color: #15803d;
    }
    .btn-outline {
      background-color: transparent;
      color: #16a34a;
      border: 1px solid #16a34a;
    }
    .btn-outline:hover {
      background-color: #f0fdf4;
    }
    .btn-secondary {
      background-color: #f3f4f6;
      color: #374151;
      border: 1px solid #e5e7eb;
    }
    .btn-secondary:hover {
      background-color: #e5e7eb;
    }
    .btn-white {
      background-color: white;
      color: #15803d;
      border: 1px solid white;
    }
    .btn-white:hover {
      background-color: #f3f4f6;
    }

    /* Navbar */
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .nav-brand {
      color: #16a34a;
      font-size: 1.5rem;
      font-weight: bold;
    }
    .nav-actions {
      display: flex;
      gap: 1rem;
    }

    /* Hero */
    .hero {
      padding: 6rem 2rem;
      text-align: center;
      background-color: white;
    }
    .hero-content {
      max-width: 800px;
      margin: 0 auto;
    }
    .badge {
      display: inline-block;
      background-color: #f0fdf4;
      color: #16a34a;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 1.5rem;
    }
    .hero h1 {
      font-size: 3rem;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      color: #111827;
    }
    .hero p {
      font-size: 1.25rem;
      color: #6b7280;
      margin-bottom: 2.5rem;
    }
    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    /* Features */
    .features {
      padding: 5rem 2rem;
      background-color: #f9fafb;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }
    .card h3 {
      font-size: 1.25rem;
      margin-top: 0;
      margin-bottom: 1rem;
      color: #1f2937;
    }
    .card p {
      color: #6b7280;
      line-height: 1.5;
      margin: 0;
    }

    /* Compteurs */
    .compteurs {
      padding: 5rem 2rem;
      text-align: center;
      background-color: #f0fdf4;
    }
    .compteurs h2 {
      margin-top: 0;
      margin-bottom: 2rem;
      color: #15803d;
      font-size: 2rem;
    }
    .badges {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .badge-type {
      padding: 0.5rem 1.5rem;
      border-radius: 999px;
      font-weight: bold;
      font-size: 1.1rem;
    }
    .cashpower { background-color: #dbeafe; color: #1e40af; }
    .classique { background-color: #fef3c7; color: #92400e; }
    .partage { background-color: #fce7f3; color: #9d174d; }

    /* CTA Final */
    .cta-final {
      padding: 6rem 2rem;
      text-align: center;
      background-color: #15803d;
      color: white;
    }
    .cta-final h2 {
      font-size: 2.5rem;
      margin-top: 0;
      margin-bottom: 2rem;
    }

    /* Footer */
    .footer {
      padding: 3rem 2rem;
      text-align: center;
      background-color: #111827;
      color: #9ca3af;
    }
    .footer p {
      margin: 0.5rem 0;
    }
  `]
})
export class HomeComponent {}
