import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../core/services/document.service';
import { Document, DocumentType, DocumentStatus } from '../../core/models/models';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-document-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-900">Gestion des Documents</h2>

      <div class="bg-white p-6 rounded-lg shadow">
        <div class="grid grid-cols-3 gap-4 mb-4">
          <select [(ngModel)]="filterType" (ngModelChange)="applyFilters()"
                  class="px-3 py-2 border border-gray-300 rounded-md">
            <option value="">Tous les types</option>
            <option value="CERTIFICAT">Certificat</option>
            <option value="BULLETIN">Bulletin</option>
            <option value="RELEVE_DE_NOTE">Relevé de note</option>
            <option value="PHOTO_IDENTITE">Photo d'identité</option>
          </select>
          
          <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()"
                  class="px-3 py-2 border border-gray-300 rounded-md">
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="VALIDE">Validé</option>
            <option value="REJETE">Rejeté</option>
          </select>
          
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()"
                 placeholder="Rechercher..."
                 class="px-3 py-2 border border-gray-300 rounded-md">
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let document of filteredDocuments">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{document.nom}}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{getTypeLabel(document.type)}}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getStatusClass(document.status!)" 
                        class="px-2 py-1 text-xs font-medium rounded-full">
                    {{getStatusLabel(document.status!)}}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{document.dateUpload | date:'short'}}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button (click)="downloadDocument(document.id!)" 
                          class="text-blue-600 hover:text-blue-900">Télécharger</button>
                  <button (click)="validateDocument(document.id!)" 
                          class="text-green-600 hover:text-green-900">Valider</button>
                  <button (click)="rejectDocument(document.id!)" 
                          class="text-red-600 hover:text-red-900">Rejeter</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DocumentManagementComponent implements OnInit {
  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  filterType = '';
  filterStatus = '';
  searchTerm = '';

  constructor(private documentService: DocumentService, private toast: ToastService) {}

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    // Simuler le chargement de tous les documents
    this.documents = [];
    this.filteredDocuments = [];
  }

  applyFilters() {
    this.filteredDocuments = this.documents.filter(doc => {
      const matchesType = !this.filterType || doc.type === this.filterType;
      const matchesStatus = !this.filterStatus || doc.status === this.filterStatus;
      const matchesSearch = !this.searchTerm || doc.nom.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    });
  }


  validateDocument(id: number) {
    console.log('Valider document:', id);
  }

  rejectDocument(id: number) {
    console.log('Rejeter document:', id);
  }

  downloadDocument(id: number) {
    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document';
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success('Téléchargement démarré.');
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.toast.error("Le téléchargement a échoué.");
      }
    });
  }

  getTypeLabel(type: DocumentType): string {
    const labels = {
      'CERTIFICAT': 'Certificat',
      'BULLETIN': 'Bulletin',
      'RELEVE_DE_NOTE': 'Relevé de note',
      'PHOTO_IDENTITE': 'Photo d\'identité'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: DocumentStatus): string {
    const labels = {
      'EN_ATTENTE': 'En attente',
      'VALIDE': 'Validé',
      'REJETE': 'Rejeté'
    };
    return labels[status] || status;
  }

  getStatusClass(status: DocumentStatus): string {
    const classes = {
      'EN_ATTENTE': 'bg-yellow-100 text-yellow-800',
      'VALIDE': 'bg-green-100 text-green-800',
      'REJETE': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}