import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 pointer-events-none z-50 flex flex-col items-end p-4 space-y-2">
      <div *ngFor="let t of toasts" class="pointer-events-auto w-full max-w-sm rounded shadow-lg border p-4 text-sm"
           [ngClass]="{
             'bg-green-50 border-green-200 text-green-900': t.type === 'success',
             'bg-red-50 border-red-200 text-red-900': t.type === 'error',
             'bg-blue-50 border-blue-200 text-blue-900': t.type === 'info',
             'bg-yellow-50 border-yellow-200 text-yellow-900': t.type === 'warning'
           }">
        <div class="flex justify-between items-start">
          <div class="pr-2">{{ t.message }}</div>
          <button class="ml-2 text-xs opacity-70 hover:opacity-100" (click)="dismiss(t.id)">Fermer</button>
        </div>
      </div>
    </div>
  `
})
export class ToastContainerComponent {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {
    this.toastService.toasts$.subscribe(list => this.toasts = list);
  }

  dismiss(id: number) {
    this.toastService.dismiss(id);
  }
}
