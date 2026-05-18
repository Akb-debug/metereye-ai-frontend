// 🔄 MODIFIÉ — home.component.ts — ajouts : routes /auth/*, design system MeterEye AI

import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private authService = inject(AuthService);
  isLoggedIn = this.authService.isLoggedIn();
  dashboardUrl = this.authService.getUserRole() === 'LOCATAIRE'
    ? '/dashboard/locataire'
    : '/dashboard/proprietaire';
}
