import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ExportOptions {
  format: 'excel' | 'csv' | 'pdf';
  dateFrom: string;
  dateTo: string;
  statuses: string[];
}

@Component({
  selector: 'app-export-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Exporter les données</h3>
            <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <!-- Format selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Format d'export</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input type="radio" [(ngModel)]="selectedFormat" value="excel" 
                         class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300">
                  <span class="ml-2 text-sm text-gray-700">Excel (.xlsx)</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" [(ngModel)]="selectedFormat" value="csv" 
                         class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300">
                  <span class="ml-2 text-sm text-gray-700">CSV (.csv)</span>
                </label>
              </div>
            </div>

            <!-- Date range -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Période</label>
              <div class="grid grid-cols-2 gap-2">
                <input type="date" [(ngModel)]="dateFrom" 
                       class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <input type="date" [(ngModel)]="dateTo" 
                       class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              </div>
            </div>

            <!-- Status filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Statuts à inclure</label>
              <div class="space-y-2">
                <label *ngFor="let status of availableStatuses" class="flex items-center">
                  <input type="checkbox" [(ngModel)]="status.selected" 
                         class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                  <span class="ml-2 text-sm text-gray-700">{{status.label}}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button (click)="close.emit()" 
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
              Annuler
            </button>
            <button (click)="onExport()" 
                    [disabled]="!selectedFormat"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
              Exporter
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ExportModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() export = new EventEmitter<ExportOptions>();

  selectedFormat = 'excel';
  dateFrom = '';
  dateTo = '';
  
  availableStatuses = [
    { value: 'PENDING', label: 'En attente', selected: true },
    { value: 'APPROVED', label: 'Approuvées', selected: true },
    { value: 'REJECTED', label: 'Rejetées', selected: false },
    { value: 'UNDER_REVIEW', label: 'En révision', selected: true }
  ];

  constructor() {
    // Dates par défaut (30 derniers jours)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    this.dateTo = today.toISOString().split('T')[0];
    this.dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
  }

  onExport(): void {
    const exportParams: ExportOptions = {
      format: this.selectedFormat as 'excel' | 'csv' | 'pdf',
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      statuses: this.availableStatuses.filter(s => s.selected).map(s => s.value)
    };
    
    this.export.emit(exportParams);
  }
}