import {
  Component, inject, signal, OnInit, OnDestroy,
  HostListener, ElementRef
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AlerteService } from '../../services/alerte.service';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit, OnDestroy {
  private authService   = inject(AuthService);
  private alerteService = inject(AlerteService);
  private elRef         = inject(ElementRef);

  nomComplet       = signal(this.authService.getNomComplet());
  nbAlertesNonLues = signal(0);
  dropdownOpen     = signal(false);

  private sub?: Subscription;

  ngOnInit(): void {
    this.sub = interval(60_000).pipe(
      startWith(0),
      switchMap(() => this.alerteService.getAlertesNonLues())
    ).subscribe({
      next: alertes => this.nbAlertesNonLues.set(alertes.length),
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
  }

  logout(): void {
    this.dropdownOpen.set(false);
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.dropdownOpen.set(false);
    }
  }

  getInitiales(): string {
    const parts = this.nomComplet().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (parts[0]?.[0] ?? 'U').toUpperCase();
  }
}
