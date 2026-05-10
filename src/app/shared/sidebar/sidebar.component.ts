// ✅ CRÉÉ — sidebar.component.ts

import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AlerteService } from '../../services/alerte.service';
import { interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {

  private authService   = inject(AuthService);
  private alerteService = inject(AlerteService);

  nomComplet        = signal(this.authService.getNomComplet());
  role              = signal(this.authService.getUserRole() ?? 'PERSONNEL');
  nbAlertesNonLues  = signal(0);

  private pollingSubscription?: Subscription;

  ngOnInit(): void {
    // Polling alertes non-lues toutes les 60 secondes
    this.pollingSubscription = interval(60_000).pipe(
      startWith(0),
      switchMap(() => this.alerteService.getAlertesNonLues())
    ).subscribe({
      next: (alertes) => this.nbAlertesNonLues.set(alertes.length),
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
  }

  getInitiales(): string {
    const parts = this.nomComplet().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (parts[0]?.[0] ?? 'U').toUpperCase();
  }
}
