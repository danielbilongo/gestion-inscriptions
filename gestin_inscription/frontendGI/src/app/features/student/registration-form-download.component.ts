import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-registration-form-download',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Fiche d'inscription</h1>
        
        <div *ngIf="formStatus" class="mb-6">
          <div class="flex items-center space-x-4">
            <div class="flex-1">
              <h3 class="text-lg font-medium">Statut de votre candidature</h3>
              <p class="text-gray-600">Candidature #{{applicationId}}</p>
            </div>
            <span [class]="getStatusClass(formStatus.status)" class="px-3 py-1 rounded-full text-sm font-medium">
              {{getStatusLabel(formStatus.status)}}
            </span>
          </div>
        </div>

        <div *ngIf="formStatus?.formAvailable" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <h4 class="text-green-800 font-medium">Félicitations !</h4>
              <p class="text-green-700">Votre candidature a été approuvée. Vous pouvez télécharger votre fiche d'inscription.</p>
            </div>
          </div>
        </div>

        <div *ngIf="!formStatus?.formAvailable && formStatus" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <h4 class="text-yellow-800 font-medium">En cours de traitement</h4>
              <p class="text-yellow-700">Votre candidature est en cours d'examen. La fiche d'inscription sera disponible après approbation.</p>
            </div>
          </div>
        </div>

        <div class="flex justify-center space-x-4">
          <button 
            *ngIf="formStatus?.formAvailable"
            (click)="downloadForm()" 
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Télécharger la fiche d'inscription
          </button>
          
          <button 
            (click)="checkStatus()" 
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Actualiser le statut
          </button>
        </div>
      </div>
    </div>
  `
})
export class RegistrationFormDownloadComponent implements OnInit {
  applicationId!: number;
  formStatus: any = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.applicationId = +params['id'];
      this.checkStatus();
    });
  }

  checkStatus() {
    fetch(`/api/registration-forms/status/${this.applicationId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.formStatus = data;
        }
      })
      .catch(error => console.error('Erreur:', error));
  }

  downloadForm() {
    const token = Date.now().toString();
    const url = `/api/registration-forms/download/${this.applicationId}?token=${token}`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `fiche_inscription_${this.applicationId}.pdf`;
    link.click();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'AGENT_VALIDATED':
        return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'Approuvé';
      case 'AGENT_VALIDATED':
        return 'Validé par agent - En attente admin';
      case 'UNDER_REVIEW':
        return 'En cours d\'examen';
      case 'REJECTED':
        return 'Rejeté';
      default:
        return status;
    }
  }
}