import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Candidature soumise avec succès !
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Votre candidature a été enregistrée et sera traitée dans les 24-48h.
                </p>
                <div *ngIf="applicationId" class="mt-3 p-3 bg-gray-50 rounded-md">
                  <p class="text-sm font-medium text-gray-700">
                    Numéro de candidature: <span class="text-indigo-600">#{{applicationId}}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button type="button" 
                    (click)="onViewDashboard()"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm">
              Voir mes candidatures
            </button>
            <button type="button" 
                    (click)="onClose()"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SuccessModalComponent {
  @Input() isVisible = false;
  @Input() applicationId: number | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() viewDashboard = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onViewDashboard(): void {
    this.viewDashboard.emit();
  }
}