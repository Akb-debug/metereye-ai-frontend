// ✅ CRÉÉ — loading-spinner.component.ts

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-wrap" [class.overlay]="overlay()">
      <div class="spinner" [style.width.px]="size()" [style.height.px]="size()"></div>
      @if (label()) { <p class="spinner-label">{{ label() }}</p> }
    </div>
  `,
  styles: [`
    .spinner-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 24px;
    }
    .spinner-wrap.overlay {
      position: fixed;
      inset: 0;
      background: rgba(255,255,255,.8);
      z-index: 9998;
    }
    .spinner {
      border: 3px solid #E5E7EB;
      border-top-color: #1A73E8;
      border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    .spinner-label {
      font-size: 14px;
      color: #6B7280;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoadingSpinnerComponent {
  size    = input<number>(36);
  overlay = input<boolean>(false);
  label   = input<string>('');
}
