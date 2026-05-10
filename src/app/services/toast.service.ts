// ✅ CRÉÉ — toast.service.ts

import { Injectable, signal } from '@angular/core';

export interface Toast {
  id:      number;
  type:    'success' | 'error' | 'warning' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {

  private counter = 0;
  toasts = signal<Toast[]>([]);

  success(message: string, duration = 3500): void {
    this.show('success', message, duration);
  }

  error(message: string, duration = 5000): void {
    this.show('error', message, duration);
  }

  warning(message: string, duration = 4000): void {
    this.show('warning', message, duration);
  }

  info(message: string, duration = 3500): void {
    this.show('info', message, duration);
  }

  remove(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private show(type: Toast['type'], message: string, duration: number): void {
    const id = ++this.counter;
    this.toasts.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.remove(id), duration);
  }
}
