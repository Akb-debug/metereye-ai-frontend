import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ToastComponent } from '../../shared/toast/toast.component';
import { ToastService } from '../../services/toast.service';
import { FacturationService, RepartitionItem } from '../../services/facturation.service';

@Component({
  selector: 'app-locataire-factures',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ToastComponent],
  templateUrl: './locataire-factures.component.html',
  styleUrl: './locataire-factures.component.scss'
})
export class LocataireFacturesComponent implements OnInit {
  private facturationService = inject(FacturationService);
  private toast              = inject(ToastService);

  factures     = signal<RepartitionItem[]>([]);
  isLoading    = signal(true);
  filterAnnee  = signal<number>(new Date().getFullYear());
  filterStatut = signal<string>('Toutes');

  anneesDisponibles = computed(() => {
    const years = new Set(this.factures().map(f => f.annee).filter((a): a is number => a != null));
    const list = Array.from(years).sort((a, b) => b - a);
    return list.length > 0 ? list : [new Date().getFullYear()];
  });

  facturesFiltrees = computed(() => {
    return this.factures().filter(f => {
      const anneeOk  = f.annee === this.filterAnnee();
      const statutOk = this.filterStatut() === 'Toutes'
        || (this.filterStatut() === 'Générées' && f.statut === 'GENEREE')
        || (this.filterStatut() === 'En attente' && f.statut !== 'GENEREE');
      return anneeOk && statutOk;
    });
  });

  ngOnInit(): void {
    this.loadFactures();
  }

  loadFactures(): void {
    this.isLoading.set(true);
    this.facturationService.getMesFactures().subscribe({
      next: (factures) => {
        this.factures.set(factures);
        if (factures.length > 0 && factures[0].annee) {
          this.filterAnnee.set(factures[0].annee);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onAnneeChange(event: Event): void {
    this.filterAnnee.set(+(event.target as HTMLSelectElement).value);
  }

  onStatutChange(event: Event): void {
    this.filterStatut.set((event.target as HTMLSelectElement).value);
  }

  getMoisLabel(mois: number): string {
    const noms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return mois >= 1 && mois <= 12 ? noms[mois - 1] : '—';
  }

  telechargerFacture(factureId?: number): void {
    if (!factureId) return;
    this.facturationService.telechargerFacture(factureId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Facture_${factureId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toast.error('Erreur lors du téléchargement')
    });
  }
}
