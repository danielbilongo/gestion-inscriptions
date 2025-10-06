import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DossierService } from '../../core/services/dossier.service';
import { DocumentService } from '../../core/services/document.service';
import { AuthService } from '../../core/services/auth.service';
import { ApplicationReviewService, ReviewDecision } from '../../core/services/application-review.service';
import { NotificationService } from '../../core/services/notification.service';
import { Dossier, Document, DossierStatus, DocumentType, Role } from '../../core/models/models';

@Component({
  selector: 'app-dossier-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto p-6 animate-fadeIn">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gestion des Dossiers</h1>
        <p class="mt-2 text-gray-600">Gérez tous les dossiers d'inscription</p>
      </div>

      <!-- Filtres -->
      <div class="bg-white rounded-lg shadow p-6 mb-6 card-hover">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()" class="input-enhanced">
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="EN_COURS">En cours</option>
              <option value="VALIDE">Validé</option>
              <option value="REJETE">Rejeté</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (ngModelChange)="applyFilters()"
              placeholder="Nom, email..."
              class="input-enhanced">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date de</label>
            <input 
              type="date" 
              [(ngModel)]="dateFrom" 
              (ngModelChange)="applyFilters()"
              class="input-enhanced">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date à</label>
            <input 
              type="date" 
              [(ngModel)]="dateTo" 
              (ngModelChange)="applyFilters()"
              class="input-enhanced">
          </div>
        </div>
      </div>

      <!-- Liste des dossiers -->
      <div class="bg-white rounded-lg shadow overflow-hidden card-hover">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            Dossiers ({{filteredDossiers.length}})
          </h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="table-enhanced min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidat</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date création</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let dossier of paginatedDossiers" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{{dossier.id}}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{dossier.candidat?.nom}} {{dossier.candidat?.prenom}}
                  </div>
                  <div class="text-sm text-gray-500">{{dossier.candidat?.email}}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getStatusClass(dossier.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{getStatusLabel(dossier.status)}}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{dossier.dateCreation | date:'short'}}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{dossier.documents?.length || 0}} docs
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button 
                    (click)="viewDossier(dossier)" 
                    class="btn-secondary">
                    Voir
                  </button>
                  <button 
                    *ngIf="dossier.status === 'VALIDE'" 
                    (click)="downloadRegistrationForm(dossier.id!)" 
                    class="px-3 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                    Fiche d'inscription
                  </button>
                  <button 
                    *ngIf="isAgent() || isAdmin()" 
                    (click)="processApplication(dossier.id!)" 
                    class="btn-primary">
                    Traiter
                  </button>
                  <button 
                    *ngIf="isAdmin()" 
                    (click)="approveApplication(dossier.id!)" 
                    class="px-3 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors">
                    Approuver
                  </button>
                  <button 
                    *ngIf="isAdmin()" 
                    (click)="openRejectModal(dossier)" 
                    class="px-3 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors">
                    Rejeter
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Affichage {{(currentPage - 1) * pageSize + 1}} à {{Math.min(currentPage * pageSize, filteredDossiers.length)}} 
            sur {{filteredDossiers.length}} résultats
          </div>
          <div class="flex space-x-2">
            <button 
              (click)="previousPage()" 
              [disabled]="currentPage === 1"
              class="btn-secondary disabled:opacity-50">
              Précédent
            </button>
            <span class="px-3 py-1 text-sm">{{currentPage}} / {{totalPages}}</span>
            <button 
              (click)="nextPage()" 
              [disabled]="currentPage === totalPages"
              class="btn-secondary disabled:opacity-50">
              Suivant
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de détail -->
      <div *ngIf="selectedDossier" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4">
          <div class="fixed inset-0 bg-black opacity-50" (click)="closeModal()"></div>
          <div class="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto relative z-10 shadow-xl">
            <div class="p-6">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold">Dossier #{{selectedDossier.id}}</h3>
                <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <!-- Informations candidat -->
              <div class="mb-6">
                <h4 class="text-lg font-medium mb-3">Informations du candidat</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Nom:</strong> {{selectedDossier.candidat?.nom}}</div>
                  <div><strong>Prénom:</strong> {{selectedDossier.candidat?.prenom}}</div>
                  <div><strong>Email:</strong> {{selectedDossier.candidat?.email}}</div>
                  <div><strong>Téléphone:</strong> {{selectedDossier.candidat?.telephone}}</div>
                </div>
              </div>
              
              <!-- Documents -->
              <div class="mb-6">
                <h4 class="text-lg font-medium mb-3">Documents ({{selectedDossierDocuments.length}})</h4>
                <div class="space-y-2">
                  <div *ngFor="let doc of selectedDossierDocuments" 
                       class="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div class="font-medium">{{doc.nom}}</div>
                      <div class="text-sm text-gray-500">{{doc.type}} - {{doc.dateUpload | date:'short'}}</div>
                    </div>
                    <div class="flex space-x-2">
                      <button class="btn-secondary text-sm" (click)="download(doc.id!)">Télécharger</button>
                      <button *ngIf="isAgent() || isAdmin()" class="btn-primary text-sm">Valider</button>
                      <button *ngIf="isAgent() || isAdmin()" class="px-3 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 text-sm">Rejeter</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Actions -->
              <div *ngIf="isAgent() || isAdmin()" class="flex justify-end space-x-4">
                <select [(ngModel)]="newStatus" class="input-enhanced">
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="VALIDE">Validé</option>
                  <option value="REJETE">Rejeté</option>
                </select>
                <button 
                  (click)="updateDossierStatus()" 
                  class="btn-primary">
                  Mettre à jour le statut
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de rejet -->
      <div *ngIf="showRejectModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4">
          <div class="fixed inset-0 bg-black opacity-50" (click)="closeRejectModal()"></div>
          <div class="bg-white rounded-lg max-w-md w-full relative z-10 shadow-xl">
            <div class="p-6">
              <h3 class="text-lg font-bold mb-4">Rejeter la candidature</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Motif du rejet</label>
                  <select [(ngModel)]="rejectReason" class="input-enhanced">
                    <option value="">Sélectionner un motif</option>
                    <option value="DOCUMENTS_INCOMPLETS">Documents incomplets</option>
                    <option value="DOCUMENTS_NON_CONFORMES">Documents non conformes</option>
                    <option value="CRITERES_NON_REMPLIS">Critères d'admission non remplis</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Document non conforme</label>
                  <select [(ngModel)]="nonCompliantDocument" class="input-enhanced">
                    <option value="">Aucun document spécifique</option>
                    <option value="DIPLOME">Diplôme</option>
                    <option value="RELEVE_NOTES">Relevé de notes</option>
                    <option value="CNI">Carte d'identité</option>
                    <option value="PHOTO">Photo d'identité</option>
                    <option value="ACTE_NAISSANCE">Acte de naissance</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Message personnalisé</label>
                  <textarea 
                    [(ngModel)]="customMessage" 
                    rows="4" 
                    class="input-enhanced" 
                    placeholder="Expliquez les raisons du rejet..."></textarea>
                </div>
              </div>
              
              <div class="flex justify-end space-x-4 mt-6">
                <button (click)="closeRejectModal()" class="btn-secondary">Annuler</button>
                <button (click)="confirmReject()" class="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700">Rejeter</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DossierManagementComponent implements OnInit {
  dossiers: Dossier[] = [];
  filteredDossiers: Dossier[] = [];
  paginatedDossiers: Dossier[] = [];
  selectedDossier: Dossier | null = null;
  selectedDossierDocuments: Document[] = [];
  
  // Filtres
  filterStatus = '';
  searchTerm = '';
  dateFrom = '';
  dateTo = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  // Modal
  newStatus: DossierStatus = DossierStatus.EN_ATTENTE;
  
  // Rejet modal
  showRejectModal = false;
  rejectingDossier: Dossier | null = null;
  rejectReason = '';
  nonCompliantDocument = '';
  customMessage = '';
  
  Math = Math;

  constructor(
    private dossierService: DossierService,
    private documentService: DocumentService,
    private authService: AuthService,
    private applicationReviewService: ApplicationReviewService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDossiers();
  }

  download(documentId: number) {
    this.documentService.downloadDocument(documentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Erreur téléchargement document:', err)
    });
  }

  loadDossiers() {
    this.dossierService.getAllDossiers().subscribe({
      next: (dossiers) => {
        console.log('=== FRONTEND COMPONENT DEBUG ===');
        console.log('Received dossiers:', dossiers);
        console.log('First dossier:', dossiers[0]);
        console.log('Dossier candidat:', dossiers[0]?.candidat);
        
        this.dossiers = dossiers;
        this.applyFilters();
        
        console.log('After applyFilters - filteredDossiers:', this.filteredDossiers);
        console.log('After applyFilters - paginatedDossiers:', this.paginatedDossiers);
      },
      error: (error) => console.error('Erreur chargement dossiers:', error)
    });
  }

  applyFilters() {
    this.filteredDossiers = this.dossiers.filter(dossier => {
      const matchesStatus = !this.filterStatus || dossier.status === this.filterStatus;
      const matchesSearch = !this.searchTerm || 
        dossier.candidat?.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        dossier.candidat?.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        dossier.candidat?.email?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      let matchesDate = true;
      if (this.dateFrom && dossier.dateCreation) {
        matchesDate = matchesDate && new Date(dossier.dateCreation) >= new Date(this.dateFrom);
      }
      if (this.dateTo && dossier.dateCreation) {
        matchesDate = matchesDate && new Date(dossier.dateCreation) <= new Date(this.dateTo);
      }
      
      return matchesStatus && matchesSearch && matchesDate;
    });
    
    this.totalPages = Math.ceil(this.filteredDossiers.length / this.pageSize);
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedDossiers = this.filteredDossiers.slice(start, end);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  viewDossier(dossier: Dossier) {
    this.selectedDossier = dossier;
    this.newStatus = dossier.status;
    this.loadDossierDocuments(dossier.id!);
  }

  loadDossierDocuments(dossierId: number) {
    this.documentService.getDocumentsByDossierId(dossierId).subscribe({
      next: (documents) => this.selectedDossierDocuments = documents,
      error: (error) => console.error('Erreur chargement documents:', error)
    });
  }

  closeModal() {
    this.selectedDossier = null;
    this.selectedDossierDocuments = [];
  }

  updateStatus(dossier: Dossier) {
    this.viewDossier(dossier);
  }

  updateDossierStatus() {
    if (this.selectedDossier) {
      // Note: Il faudrait une API pour mettre à jour le statut
      this.selectedDossier.status = this.newStatus;
      alert('Statut mis à jour avec succès!');
      this.closeModal();
      this.loadDossiers();
    }
  }

  deleteDossier(dossierId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier?')) {
      this.dossierService.deleteDossier(dossierId).subscribe({
        next: () => {
          this.loadDossiers();
          alert('Dossier supprimé avec succès!');
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  // Utility methods
  isCandidat(): boolean {
    return this.authService.isCandidate();
  }

  isAgent(): boolean {
    return this.authService.isAgent();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getStatusClass(status: DossierStatus): string {
    switch (status) {
      case DossierStatus.EN_ATTENTE:
        return 'bg-yellow-100 text-yellow-800';
      case DossierStatus.EN_COURS:
        return 'bg-blue-100 text-blue-800';
      case DossierStatus.VALIDE:
        return 'bg-green-100 text-green-800';
      case DossierStatus.REJETE:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: DossierStatus): string {
    switch (status) {
      case DossierStatus.EN_ATTENTE:
        return 'En attente';
      case DossierStatus.EN_COURS:
        return 'En cours';
      case DossierStatus.VALIDE:
        return 'Validé';
      case DossierStatus.REJETE:
        return 'Rejeté';
      default:
        return status;
    }
  }

  processApplication(applicationId: number) {
    // Rediriger vers le workflow de traitement
    this.router.navigate(['/workflow', applicationId]);
  }

  approveApplication(applicationId: number) {
    const comment = prompt('Commentaire d\'approbation (optionnel):');
    this.notificationService.processApplication(applicationId, 'APPROVED', comment || undefined).subscribe({
      next: (response) => {
        alert('Candidature approuvée avec succès. Notification envoyée au candidat.');
        this.loadDossiers();
      },
      error: (error) => {
        console.error('Erreur approbation:', error);
        alert('Erreur lors de l\'approbation');
      }
    });
  }

  openRejectModal(dossier: Dossier) {
    this.rejectingDossier = dossier;
    this.showRejectModal = true;
    this.rejectReason = '';
    this.nonCompliantDocument = '';
    this.customMessage = '';
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.rejectingDossier = null;
  }

  confirmReject() {
    if (!this.rejectingDossier || !this.rejectReason) {
      alert('Veuillez sélectionner un motif de rejet');
      return;
    }

    let rejectComment = this.rejectReason;
    if (this.nonCompliantDocument) {
      rejectComment += ` - Document non conforme: ${this.nonCompliantDocument}`;
    }
    if (this.customMessage) {
      rejectComment += ` - ${this.customMessage}`;
    }

    this.notificationService.processApplication(this.rejectingDossier.id!, 'REJECTED', rejectComment).subscribe({
      next: (response) => {
        alert('Candidature rejetée avec succès. Notification envoyée au candidat.');
        this.closeRejectModal();
        this.loadDossiers();
      },
      error: (error) => {
        console.error('Erreur rejet:', error);
        alert('Erreur lors du rejet');
      }
    });
  }

  downloadRegistrationForm(applicationId: number) {
    this.dossierService.downloadRegistrationForm(applicationId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fiche_inscription_${applicationId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur téléchargement fiche:', error);
        alert('Erreur lors du téléchargement de la fiche d\'inscription');
      }
    });
  }
}