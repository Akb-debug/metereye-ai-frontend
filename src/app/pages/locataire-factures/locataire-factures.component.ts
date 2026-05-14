import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FacturationService } from '../../services/facturation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-locataire-factures',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './locataire-factures.component.html',
  styleUrl: './locataire-factures.component.scss'
})
export class LocataireFacturesComponent implements OnInit {
  private facturationService = inject(FacturationService);
  private authService = inject(AuthService);

  factures = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadFactures();
  }

  loadFactures(): void {
    this.isLoading.set(true);
    // On simule des données basées sur le screenshot pour la démo, 
    // en réel on appellerait un endpoint spécifique locataire
    setTimeout(() => {
      this.factures.set([
        {
          id: 1,
          moisLabel: 'Mai',
          annee: 2026,
          compteurRef: 'ADD-001',
          consommation: 85,
          partPourcentage: 26.6,
          montant: 5208,
          dateGeneration: new Date('2026-06-01'),
          statut: 'DISPONIBLE'
        },
        {
          id: 2,
          moisLabel: 'Avril',
          annee: 2026,
          compteurRef: 'ADD-001',
          consommation: 78,
          partPourcentage: 24.2,
          montant: 4836,
          dateGeneration: new Date('2026-05-01'),
          statut: 'TELECHARGEE'
        },
        {
          id: 3,
          moisLabel: 'Mars',
          annee: 2026,
          compteurRef: 'ADD-001',
          consommation: 92,
          partPourcentage: 28.6,
          montant: 5704,
          dateGeneration: new Date('2026-04-01'),
          statut: 'TELECHARGEE'
        }
      ]);
      this.isLoading.set(false);
    }, 1000);
  }
}
