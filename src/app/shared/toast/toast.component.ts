// ✅ CRÉÉ — toast.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}">
          <span class="toast-icon">
            @if (toast.type === 'success') { <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#34A853" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> }
            @if (toast.type === 'error')   { <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 9l-6 6M9 9l6 6"/></svg> }
            @if (toast.type === 'warning') { <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#F59E0B" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg> }
            @if (toast.type === 'info')    { <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1A73E8" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4m0-4h.01"/></svg> }
          </span>
          <span style="flex:1">{{ toast.message }}</span>
          <button class="btn-close" (click)="toastService.remove(toast.id)" aria-label="Fermer">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container { position:fixed; top:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px; }
    .toast { display:flex; align-items:center; gap:12px; padding:14px 18px; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,.12); background:#fff; border-left:4px solid; min-width:280px; max-width:420px; animation:slideInRight .25s ease; font-size:14px; font-weight:500; }
    .toast-success { border-color:#34A853; }
    .toast-error   { border-color:#EF4444; }
    .toast-warning { border-color:#F59E0B; }
    .toast-info    { border-color:#1A73E8; }
    .toast-icon    { flex-shrink:0; display:flex; }
    .btn-close     { background:none; border:none; cursor:pointer; color:#9CA3AF; display:flex; padding:2px; border-radius:4px; }
    .btn-close:hover { color:#374151; background:#F3F4F6; }
    @keyframes slideInRight { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
