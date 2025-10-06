import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AutoSaveService, AutoSaveStatus } from '../../core/services/auto-save.service';

@Component({
  selector: 'app-auto-save-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center space-x-2 text-sm">
      <!-- Icône de statut -->
      <div class="flex items-center">
        <!-- Idle -->
        <svg *ngIf="status.status === 'idle'" 
             class="w-4 h-4 text-gray-400" 
             fill="currentColor" 
             viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        
        <!-- Saving -->
        <svg *ngIf="status.status === 'saving'" 
             class="w-4 h-4 text-blue-500 animate-spin" 
             fill="none" 
             viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        
        <!-- Saved -->
        <svg *ngIf="status.status === 'saved'" 
             class="w-4 h-4 text-green-500" 
             fill="currentColor" 
             viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        
        <!-- Error -->
        <svg *ngIf="status.status === 'error'" 
             class="w-4 h-4 text-red-500" 
             fill="currentColor" 
             viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
      </div>
      
      <!-- Message de statut -->
      <span [ngClass]="{
        'text-gray-600': status.status === 'idle',
        'text-blue-600': status.status === 'saving',
        'text-green-600': status.status === 'saved',
        'text-red-600': status.status === 'error'
      }">
        <span *ngIf="status.status === 'idle'">Prêt</span>
        <span *ngIf="status.status === 'saving'">Sauvegarde...</span>
        <span *ngIf="status.status === 'saved'">
          Sauvegardé
          <span *ngIf="status.lastSaved" class="text-xs text-gray-500">
            ({{formatTime(status.lastSaved)}})
          </span>
        </span>
        <span *ngIf="status.status === 'error'" [title]="status.error">
          Erreur de sauvegarde
        </span>
      </span>
      
      <!-- Indicateur de connectivité -->
      <div class="flex items-center ml-2" *ngIf="!isOnline">
        <svg class="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"/>
        </svg>
        <span class="text-xs text-orange-600 ml-1">Hors ligne</span>
      </div>
      
      <!-- Indicateur d'espace de stockage -->
      <div *ngIf="storageInfo.percentage > 80" 
           class="flex items-center ml-2 text-orange-600"
           [title]="'Espace utilisé: ' + storageInfo.percentage.toFixed(1) + '%'">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <span class="text-xs ml-1">Stockage plein</span>
      </div>
    </div>
  `
})
export class AutoSaveIndicatorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  status: AutoSaveStatus = { status: 'idle' };
  isOnline = navigator.onLine;
  storageInfo = { used: 0, available: 0, percentage: 0 };

  constructor(private autoSaveService: AutoSaveService) {}

  ngOnInit(): void {
    // Observer le statut de sauvegarde
    this.autoSaveService.status$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.status = status;
      });

    // Observer la connectivité
    this.autoSaveService.onlineStatusChanged()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOnline => {
        this.isOnline = isOnline;
      });

    // Vérifier l'espace de stockage périodiquement
    this.checkStorageSpace();
    setInterval(() => this.checkStorageSpace(), 30000); // Toutes les 30 secondes
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkStorageSpace(): void {
    this.storageInfo = this.autoSaveService.checkStorageSpace();
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) {
      return 'à l\'instant';
    } else if (diffMinutes < 60) {
      return `il y a ${diffMinutes}min`;
    } else if (diffHours < 24) {
      return `il y a ${diffHours}h`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }
}