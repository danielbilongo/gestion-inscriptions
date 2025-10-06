import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  timeoutMs?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  private idSeq = 1;

  private push(toast: Omit<Toast, 'id'>) {
    const id = this.idSeq++;
    const t: Toast = { id, ...toast };
    const list = [...this.toastsSubject.value, t];
    this.toastsSubject.next(list);
    if (toast.timeoutMs && toast.timeoutMs > 0) {
      setTimeout(() => this.dismiss(id), toast.timeoutMs);
    }
  }

  dismiss(id: number) {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }

  clear() {
    this.toastsSubject.next([]);
  }

  show(message: string, type: ToastType = 'info', timeoutMs = 4000) {
    this.push({ message, type, timeoutMs });
  }

  success(message: string, timeoutMs = 4000) { this.show(message, 'success', timeoutMs); }
  error(message: string, timeoutMs = 5000) { this.show(message, 'error', timeoutMs); }
  info(message: string, timeoutMs = 4000) { this.show(message, 'info', timeoutMs); }
  warning(message: string, timeoutMs = 4000) { this.show(message, 'warning', timeoutMs); }
}
