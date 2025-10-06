import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationReviewService, ReviewDecision } from '../../core/services/application-review.service';
import { DossierService } from '../../core/services/dossier.service';
import { DocumentService } from '../../core/services/document.service';
import { AuthService } from '../../core/services/auth.service';
import { Dossier, Document, Role } from '../../core/models/models';

@Component({
  selector: 'app-application-workflow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto p-6">
      <!-- En-tête -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Traitement de la candidature #{{applicationId}}</h1>
            <p class="text-gray-600">Workflow de validation et traitement</p>
          </div>
          <button (click)="goBack()" class="btn-secondary">
            ← Retour à la liste
          </button>
        </div>
      </div>

      <!-- Étapes du workflow -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Étapes du traitement</h2>
        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">1</div>
            <span class="ml-2 text-sm">Soumission</span>
          </div>
          <div class="flex-1 h-1 bg-gray-200">
            <div class="h-1 bg-green-500" [style.width]="getProgressWidth()"></div>
          </div>
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full" [class]="getStepClass(2)">2</div>
            <span class="ml-2 text-sm">Vérification documents</span>
          </div>
          <div class="flex-1 h-1 bg-gray-200">
            <div class="h-1 bg-green-500" [style.width]="getProgressWidth()"></div>
          </div>
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full" [class]="getStepClass(3)">3</div>
            <span class="ml-2 text-sm">Validation finale</span>
          </div>
        </div>
      </div>

      <!-- Informations candidat -->
      <div class="bg-white rounded-lg shadow p-6 mb-6" *ngIf="dossier">
        <h2 class="text-lg font-semibold mb-4">Informations du candidat</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nom complet</label>
            <p class="mt-1 text-sm text-gray-900">{{dossier.candidat?.nom}} {{dossier.candidat?.prenom}}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <p class="mt-1 text-sm text-gray-900">{{dossier.candidat?.email}}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Téléphone</label>
            <p class="mt-1 text-sm text-gray-900">{{dossier.candidat?.telephone}}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Statut actuel</label>
            <span [class]="getStatusClass(dossier.status)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
              {{getStatusLabel(dossier.status)}}
            </span>
          </div>
        </div>
      </div>

      <!-- Documents à vérifier -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Documents soumis ({{documents.length}})</h2>
        <div class="space-y-4">
          <div *ngFor="let doc of documents" class="border rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{{doc.nom}}</h3>
                <p class="text-sm text-gray-500">{{doc.type}} • Uploadé le {{doc.dateUpload | date:'short'}}</p>
              </div>
              <div class="flex items-center space-x-2">
                <select [(ngModel)]="documentValidations[doc.id!]" class="text-sm border rounded px-2 py-1">
                  <option value="">Non vérifié</option>
                  <option value="VALID">Valide</option>
                  <option value="INVALID">Non conforme</option>
                  <option value="MISSING">Manquant</option>
                </select>
                <button (click)="previewDocument(doc.id!)" class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                  Aperçu
                </button>
                <button (click)="downloadDocument(doc.id!)" class="btn-secondary text-sm">
                  Télécharger
                </button>
              </div>
            </div>
            <div *ngIf="documentValidations[doc.id!] === 'INVALID'" class="mt-2">
              <textarea 
                [(ngModel)]="documentComments[doc.id!]" 
                placeholder="Commentaire sur la non-conformité..."
                class="w-full text-sm border rounded px-3 py-2"
                rows="2"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions de traitement -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Actions de traitement</h2>
        
        <!-- Commentaire général -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Commentaire de traitement</label>
          <textarea 
            [(ngModel)]="processingComment" 
            placeholder="Ajoutez vos observations sur cette candidature..."
            class="w-full border rounded px-3 py-2"
            rows="3"></textarea>
        </div>

        <!-- Actions Agent -->
        <div *ngIf="isAgent()" class="flex justify-end space-x-4">
          <button 
            (click)="saveProgress()" 
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Sauvegarder le progrès
          </button>
          
          <button 
            (click)="requestChanges()" 
            class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            Demander des modifications
          </button>
          
          <button 
            (click)="validateForAdmin()" 
            [disabled]="!canValidate()"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            Valider pour l'admin
          </button>
        </div>

        <!-- Actions Admin -->
        <div *ngIf="isAdmin()" class="flex justify-end space-x-4">
          <button 
            (click)="openRejectModal()" 
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Rejeter définitivement
          </button>
          
          <button 
            (click)="finalApprove()" 
            [disabled]="!canFinalApprove()"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            Approuver - Générer fiche
          </button>
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
                  <label class="block text-sm font-medium text-gray-700 mb-2">Motif principal</label>
                  <select [(ngModel)]="rejectReason" class="w-full border rounded px-3 py-2">
                    <option value="">Sélectionner un motif</option>
                    <option value="DOCUMENTS_INCOMPLETS">Documents incomplets</option>
                    <option value="DOCUMENTS_NON_CONFORMES">Documents non conformes</option>
                    <option value="CRITERES_NON_REMPLIS">Critères d'admission non remplis</option>
                    <option value="AUTRE">Autre motif</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Document problématique</label>
                  <select [(ngModel)]="nonCompliantDocument" class="w-full border rounded px-3 py-2">
                    <option value="">Aucun document spécifique</option>
                    <option value="DIPLOME">Diplôme</option>
                    <option value="RELEVE_NOTES">Relevé de notes</option>
                    <option value="CNI">Carte d'identité</option>
                    <option value="PHOTO">Photo d'identité</option>
                    <option value="ACTE_NAISSANCE">Acte de naissance</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Message détaillé</label>
                  <textarea 
                    [(ngModel)]="customMessage" 
                    rows="4" 
                    class="w-full border rounded px-3 py-2" 
                    placeholder="Expliquez en détail les raisons du rejet..."></textarea>
                </div>
              </div>
              
              <div class="flex justify-end space-x-4 mt-6">
                <button (click)="closeRejectModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700">
                  Annuler
                </button>
                <button (click)="confirmReject()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Confirmer le rejet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ApplicationWorkflowComponent implements OnInit {
  applicationId!: number;
  dossier: Dossier | null = null;
  documents: Document[] = [];
  
  // Validation des documents
  documentValidations: { [key: number]: string } = {};
  documentComments: { [key: number]: string } = {};
  
  // Traitement
  processingComment = '';
  currentStep = 2; // Étape actuelle du workflow
  
  // Modal de rejet
  showRejectModal = false;
  rejectReason = '';
  nonCompliantDocument = '';
  customMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationReviewService: ApplicationReviewService,
    private dossierService: DossierService,
    private documentService: DocumentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.applicationId = +params['id'];
      this.loadApplicationData();
    });
  }

  loadApplicationData() {
    // Charger les données du dossier
    this.dossierService.getDossierById(this.applicationId).subscribe({
      next: (dossier) => {
        this.dossier = dossier;
        this.loadDocuments();
      },
      error: (error) => console.error('Erreur chargement dossier:', error)
    });
  }

  loadDocuments() {
    this.documentService.getDocumentsByDossierId(this.applicationId).subscribe({
      next: (documents) => {
        this.documents = Array.isArray(documents) ? documents : [];
        // Initialiser les validations
        this.documents.forEach(doc => {
          if (doc.id) {
            this.documentValidations[doc.id] = '';
            this.documentComments[doc.id] = '';
          }
        });
      },
      error: (error) => {
        console.error('Erreur chargement documents:', error);
        this.documents = [];
      }
    });
  }

  previewDocument(documentId: number) {
    // Ouvrir l'aperçu du document dans une nouvelle fenêtre
    const previewUrl = `/api/documents/${documentId}/preview`;
    window.open(previewUrl, '_blank', 'width=800,height=600');
  }

  downloadDocument(documentId: number) {
    this.documentService.downloadDocument(documentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Erreur téléchargement:', err)
    });
  }

  saveProgress() {
    // Sauvegarder le progrès du traitement
    console.log('Sauvegarde du progrès:', {
      documentValidations: this.documentValidations,
      documentComments: this.documentComments,
      processingComment: this.processingComment
    });
    alert('Progrès sauvegardé avec succès');
  }

  canValidate(): boolean {
    // Agent peut valider si tous les documents sont vérifiés
    return this.documents.every(doc => 
      doc.id && this.documentValidations[doc.id] !== ''
    );
  }

  canFinalApprove(): boolean {
    // Admin peut approuver si l'agent a validé ou si c'est en révision
    const status = this.dossier?.status?.toString();
    return status === 'AGENT_VALIDATED' || status === 'UNDER_REVIEW';
  }

  validateForAdmin() {
    if (!this.canValidate()) {
      alert('Tous les documents doivent être vérifiés');
      return;
    }

    const validationData = {
      comment: this.processingComment,
      documentsValid: this.documents.every(doc => 
        doc.id && this.documentValidations[doc.id] === 'VALID'
      )
    };

    fetch(`/api/agent/applications/${this.applicationId}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validationData)
    }).then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Candidature validée - En attente d\'approbation admin');
        this.router.navigate(['/dossiers']);
      }
    });
  }

  requestChanges() {
    const changesData = {
      comment: this.processingComment,
      requiredChanges: prompt('Quelles modifications sont nécessaires ?')
    };

    if (!changesData.requiredChanges) return;

    fetch(`/api/agent/applications/${this.applicationId}/request-changes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changesData)
    }).then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Modifications demandées au candidat');
        this.router.navigate(['/dossiers']);
      }
    });
  }

  finalApprove() {
    if (!this.canFinalApprove()) {
      alert('La candidature doit être validée par un agent d\'abord');
      return;
    }

    fetch(`/api/admin/applications/${this.applicationId}/final-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Candidature approuvée - Fiche d\'inscription générée');
        this.router.navigate(['/dossiers']);
      }
    });
  }

  openRejectModal() {
    this.showRejectModal = true;
    this.rejectReason = '';
    this.nonCompliantDocument = '';
    this.customMessage = '';
  }

  closeRejectModal() {
    this.showRejectModal = false;
  }

  confirmReject() {
    if (!this.rejectReason) {
      alert('Veuillez sélectionner un motif de rejet');
      return;
    }

    const decision: ReviewDecision = {
      reason: this.rejectReason,
      nonCompliantDocument: this.nonCompliantDocument || undefined,
      customMessage: this.customMessage || undefined
    };

    this.applicationReviewService.rejectApplication(this.applicationId, decision).subscribe({
      next: (response) => {
        alert('Candidature rejetée avec succès');
        this.closeRejectModal();
        this.router.navigate(['/dossiers']);
      },
      error: (error) => {
        console.error('Erreur rejet:', error);
        alert('Erreur lors du rejet');
      }
    });
  }

  goBack() {
    this.router.navigate(['/dossiers']);
  }

  // Utility methods
  isAdmin(): boolean {
    return this.authService.currentUserValue?.roles?.includes(Role.ADMIN) || false;
  }

  isAgent(): boolean {
    return this.authService.currentUserValue?.roles?.includes(Role.AGENT) || false;
  }

  getProgressWidth(): string {
    return `${(this.currentStep / 3) * 100}%`;
  }

  getStepClass(step: number): string {
    if (step <= this.currentStep) {
      return 'bg-green-500 text-white flex items-center justify-center text-sm font-medium';
    }
    return 'bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW':
      case 'EN_COURS':
        return 'bg-blue-100 text-blue-800';
      case 'AGENT_VALIDATED':
        return 'bg-purple-100 text-purple-800';
      case 'CHANGES_REQUESTED':
        return 'bg-orange-100 text-orange-800';
      case 'APPROVED':
      case 'VALIDE':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
      case 'REJETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING':
      case 'EN_ATTENTE':
        return 'En attente';
      case 'UNDER_REVIEW':
      case 'EN_COURS':
        return 'En révision';
      case 'AGENT_VALIDATED':
        return 'Validé par agent - En attente admin';
      case 'CHANGES_REQUESTED':
        return 'Modifications demandées';
      case 'APPROVED':
      case 'VALIDE':
        return 'Approuvées';
      case 'REJECTED':
      case 'REJETE':
        return 'Rejetées';
      default:
        return status;
    }
  }
}