import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { RegistrationFormService, RegistrationFormData } from '../../../core/services/registration-form.service';

@Component({
  selector: 'app-review-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Révision de votre dossier</h2>
        <p class="text-gray-600">Vérifiez toutes vos informations avant de soumettre votre candidature.</p>
      </div>

      <!-- Résumé des informations -->
      <div class="space-y-6">
        
        <!-- Informations personnelles -->
        <div class="bg-gray-50 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Informations Personnelles</h3>
            <button type="button" 
                    (click)="editStep(1)"
                    class="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
              Modifier
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-700">Nom:</span>
              <span class="ml-2 text-gray-900">{{formData.personalInfo.lastName}}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Prénom(s):</span>
              <span class="ml-2 text-gray-900">{{formData.personalInfo.firstNames.join(' ')}}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Sexe:</span>
              <span class="ml-2 text-gray-900">{{getGenderLabel(formData.personalInfo.gender)}}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Date de naissance:</span>
              <span class="ml-2 text-gray-900">{{formatDate(formData.personalInfo.birthDate)}}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Nationalité:</span>
              <span class="ml-2 text-gray-900">{{getNationalityLabel(formData.personalInfo.nationality)}}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Type de pièce:</span>
              <span class="ml-2 text-gray-900">{{getIdTypeLabel(formData.personalInfo.idType)}}</span>
            </div>
          </div>
        </div>

        <!-- Documents -->
        <div class="bg-gray-50 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Documents</h3>
            <button type="button" 
                    (click)="editStep(2)"
                    class="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
              Modifier
            </button>
          </div>
          
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Diplôme du Baccalauréat</span>
              <span class="flex items-center">
                <svg *ngIf="formData.documents.baccalaureate" class="h-5 w-5 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <svg *ngIf="!formData.documents.baccalaureate" class="h-5 w-5 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm text-gray-600">
                  {{formData.documents.baccalaureate ? 'Téléchargé' : 'Manquant'}}
                </span>
              </span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">CNI Recto</span>
              <span class="flex items-center">
                <svg *ngIf="formData.documents.idCardFront" class="h-5 w-5 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <svg *ngIf="!formData.documents.idCardFront" class="h-5 w-5 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm text-gray-600">
                  {{formData.documents.idCardFront ? 'Téléchargé' : 'Manquant'}}
                </span>
              </span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">CNI Verso</span>
              <span class="flex items-center">
                <svg *ngIf="formData.documents.idCardBack" class="h-5 w-5 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <svg *ngIf="!formData.documents.idCardBack" class="h-5 w-5 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm text-gray-600">
                  {{formData.documents.idCardBack ? 'Téléchargé' : 'Manquant'}}
                </span>
              </span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Acte de naissance</span>
              <span class="flex items-center">
                <svg *ngIf="formData.documents.birthCertificate" class="h-5 w-5 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <svg *ngIf="!formData.documents.birthCertificate" class="h-5 w-5 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm text-gray-600">
                  {{formData.documents.birthCertificate ? 'Téléchargé' : 'Manquant'}}
                </span>
              </span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Photo d'identité</span>
              <span class="flex items-center">
                <svg *ngIf="formData.documents.identityPhoto" class="h-5 w-5 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <svg *ngIf="!formData.documents.identityPhoto" class="h-5 w-5 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm text-gray-600">
                  {{formData.documents.identityPhoto ? 'Téléchargé' : 'Manquant'}}
                </span>
              </span>
            </div>
            
            <div *ngIf="formData.documents.higherDiplomas && formData.documents.higherDiplomas.length > 0" class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Diplômes supérieurs</span>
              <span class="flex items-center">
                <svg class="h-5 w-5 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm text-gray-600">
                  {{formData.documents.higherDiplomas.length}} fichier(s)
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Parcours académique -->
        <div class="bg-gray-50 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Parcours Académique</h3>
            <button type="button" 
                    (click)="editStep(3)"
                    class="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
              Modifier
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-700">Établissement:</span>
              <span class="ml-2 text-gray-900">{{formData.academicHistory.lastInstitution}}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Niveau:</span>
              <span class="ml-2 text-gray-900">{{formData.academicHistory.educationLevel}}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Spécialisation:</span>
              <span class="ml-2 text-gray-900">{{getSpecializationLabel(formData.academicHistory.specialization)}}</span>
            </div>
            <div *ngIf="formData.academicHistory.subSpecialization">
              <span class="font-medium text-gray-700">Sous-spécialisation:</span>
              <span class="ml-2 text-gray-900">{{formData.academicHistory.subSpecialization}}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Période:</span>
              <span class="ml-2 text-gray-900">
                {{formatDate(formData.academicHistory.startDate)}} - {{formatDate(formData.academicHistory.endDate)}}
              </span>
            </div>
            <div *ngIf="formData.academicHistory.gpa">
              <span class="font-medium text-gray-700">Moyenne:</span>
              <span class="ml-2 text-gray-900">{{formData.academicHistory.gpa}}/20</span>
            </div>
          </div>
          
          <div *ngIf="formData.academicHistory.honors && formData.academicHistory.honors.length > 0" class="mt-4">
            <span class="font-medium text-gray-700">Mentions:</span>
            <ul class="mt-1 list-disc list-inside text-sm text-gray-900">
              <li *ngFor="let honor of formData.academicHistory.honors">{{honor}}</li>
            </ul>
          </div>
        </div>

        <!-- Coordonnées -->
        <div class="bg-gray-50 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Coordonnées</h3>
            <button type="button" 
                    (click)="editStep(4)"
                    class="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
              Modifier
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-700">Email:</span>
                <span class="ml-2 text-gray-900">{{formData.contactInfo.email}}</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">Téléphone:</span>
                <span class="ml-2 text-gray-900">{{formData.contactInfo.countryCode}} {{formData.contactInfo.phone}}</span>
              </div>
            </div>
            
            <div>
              <span class="font-medium text-gray-700">Adresse:</span>
              <div class="ml-2 text-gray-900">
                {{formData.contactInfo.address.street}}<br>
                {{formData.contactInfo.address.postalCode}} {{formData.contactInfo.address.city}}<br>
                {{getCountryLabel(formData.contactInfo.address.country)}}
              </div>
            </div>
            
            <div>
              <span class="font-medium text-gray-700">Contact d'urgence:</span>
              <div class="ml-2 text-gray-900">
                {{formData.contactInfo.emergencyContact.name}} ({{getRelationshipLabel(formData.contactInfo.emergencyContact.relationship)}})<br>
                {{formData.contactInfo.emergencyContact.phone}}
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Validation finale -->
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <div>
            <h3 class="text-sm font-medium text-yellow-800">Vérification finale</h3>
            <p class="mt-1 text-sm text-yellow-700">
              Veuillez vérifier que toutes vos informations sont correctes. Une fois soumis, 
              votre dossier sera traité par nos équipes dans un délai de 24-48h.
            </p>
          </div>
        </div>
      </div>

      <!-- Déclaration sur l'honneur -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-start">
          <input id="declaration" 
                 type="checkbox" 
                 [(ngModel)]="declarationAccepted"
                 (change)="onDeclarationChange()"
                 class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1">
          <label for="declaration" class="ml-3 text-sm text-gray-700">
            <span class="font-medium">Déclaration sur l'honneur</span><br>
            Je certifie sur l'honneur que toutes les informations fournies dans ce dossier sont exactes et complètes. 
            Je m'engage à fournir tout document complémentaire qui pourrait m'être demandé et j'accepte que toute 
            fausse déclaration puisse entraîner l'annulation de ma candidature.
          </label>
        </div>
        
        <div *ngIf="!declarationAccepted && showDeclarationError" class="mt-2 text-sm text-red-600">
          Vous devez accepter la déclaration sur l'honneur pour continuer.
        </div>
      </div>

    </div>
  `
})
export class ReviewStepComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  formData!: RegistrationFormData;
  declarationAccepted = false;
  showDeclarationError = false;

  constructor(private registrationService: RegistrationFormService) {}

  ngOnInit(): void {
    this.registrationService.formData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.formData = data;
        this.validateStep();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  editStep(stepId: number): void {
    this.registrationService.goToStep(stepId);
  }

  private validateStep(): void {
    // Vérifier que la déclaration est acceptée
    this.registrationService.markStepValid(5, this.declarationAccepted);
  }

  onDeclarationChange(): void {
    this.showDeclarationError = false;
    this.validateStep();
  }

  // Méthodes utilitaires pour l'affichage
  getGenderLabel(gender: string): string {
    const labels: { [key: string]: string } = {
      'M': 'Masculin',
      'F': 'Féminin',
      'NON_BINARY': 'Non-binaire'
    };
    return labels[gender] || gender;
  }

  getNationalityLabel(code: string): string {
    const countries: { [key: string]: string } = {
      'FR': 'France',
      'DZ': 'Algérie',
      'MA': 'Maroc',
      'TN': 'Tunisie',
      'SN': 'Sénégal',
      'CI': 'Côte d\'Ivoire',
      'CM': 'Cameroun'
    };
    return countries[code] || code;
  }

  getIdTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'CNI': 'Carte Nationale d\'Identité',
      'PASSPORT': 'Passeport',
      'BIRTH_CERTIFICATE': 'Acte de naissance'
    };
    return types[type] || type;
  }

  getSpecializationLabel(code: string): string {
    const specializations: { [key: string]: string } = {
      'INFORMATIQUE': 'Informatique',
      'MATHEMATIQUES': 'Mathématiques',
      'PHYSIQUE': 'Physique',
      'CHIMIE': 'Chimie',
      'BIOLOGIE': 'Biologie',
      'ECONOMIE': 'Économie',
      'GESTION': 'Gestion',
      'DROIT': 'Droit',
      'LETTRES': 'Lettres',
      'LANGUES': 'Langues'
    };
    return specializations[code] || code;
  }

  getCountryLabel(code: string): string {
    return this.getNationalityLabel(code);
  }

  getRelationshipLabel(relationship: string): string {
    const relationships: { [key: string]: string } = {
      'PARENT': 'Parent',
      'CONJOINT': 'Conjoint(e)',
      'FRERE_SOEUR': 'Frère/Sœur',
      'AMI': 'Ami(e)',
      'AUTRE': 'Autre'
    };
    return relationships[relationship] || relationship;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }
}