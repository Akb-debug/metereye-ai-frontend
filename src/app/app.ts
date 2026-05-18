import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { TopbarComponent } from './shared/topbar/topbar.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TopbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('metereye-ai-frontend');

  private router = inject(Router);
  showLayout = signal(false);

  private routeSub?: Subscription;

  ngOnInit(): void {
    this.routeSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      this.showLayout.set(this.needsLayout(e.urlAfterRedirects));
    });
    this.showLayout.set(this.needsLayout(this.router.url));
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private needsLayout(url: string): boolean {
    const path = url.split('?')[0].split('#')[0];
    if (path === '/' || path === '') return false;
    if (path.startsWith('/auth/')) return false;
    if (path.startsWith('/onboarding/')) return false;
    return true;
  }
}
