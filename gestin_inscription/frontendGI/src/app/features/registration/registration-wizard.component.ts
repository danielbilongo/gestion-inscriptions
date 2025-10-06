import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RegistrationFormService, RegistrationStep, RegistrationFormData } from '../../core/services/registration-form.service';
import { ApplicationService, ApplicationSubmissionRequest, DocumentUploadRequest } from '../../core/services/application.service';
import { AuthDebugService } from '../../core/services/auth-debug.service';
import { AuthService } from '../../core/services/auth.service';
import { PersonalInfoStepComponent } from './steps/personal-info-step.component';
import { DocumentsStepComponent } from './steps/documents-step.component';
import { AcademicHistoryStepComponent } from './steps/academic-history-step.component';
import { ContactInfoStepComponent } from './steps/contact-info-step.component';
import { ReviewStepComponent } from './steps/review-step.component';
import { AutoSaveIndicatorComponent } from '../../shared/components/auto-save-indicator.component';
import { SuccessModalComponent } from '../../shared/components/success-modal.component';

@Component({
  selector: 'app-registration-wizard',
  standalone: true,
  imports: [
    CommonModule,
    PersonalInfoStepComponent,
    DocumentsStepComponent,
    AcademicHistoryStepComponent,
    ContactInfoStepComponent,
    ReviewStepComponent,
    AutoSaveIndicatorComponent,
    SuccessModalComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Formulaire d'Inscription</h1>
          <p class="mt-2 text-gray-600">Complétez votre dossier en 5 étapes simples</p>
        </div>

        <!-- Progress Bar -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-gray-700">Progression</span>
            <span class="text-sm font-medium text-indigo-600">{{progress}}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                 [style.width.%]="progress"></div>
          </div>
        </div>

        <!-- Steps Navigation -->
        <nav class="mb-8" aria-label="Progress">
          <ol class="flex items-center justify-between">
            <li *ngFor="let step of steps; let i = index" 
                class="relative flex-1" 
                [class.pr-8]="i < steps.length - 1"
                [class.sm:pr-20]="i < steps.length - 1">
              
              <!-- Step Circle -->
              <div class="absolute inset-0 flex items-center" 
                   [attr.aria-current]="step.current ? 'step' : null">
                <div class="h-full w-0.5 bg-gray-200" 
                     *ngIf="i < steps.length - 1"></div>
              </div>
              
              <div class="relative flex items-start group cursor-pointer"
                   (click)="goToStep(step.id)">
                <span class="h-9 flex items-center">
                  <span class="relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200"
                        [ngClass]="{
                          'bg-indigo-600 text-white': step.current,
                          'bg-green-600 text-white': step.completed,
                          'bg-white border-2 border-gray-300 text-gray-500': !step.current && !step.completed
                        }">
                    <svg *ngIf="step.completed" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    <span *ngIf="!step.completed">{{step.id}}</span>
                  </span>
                </span>
                <span class="ml-4 min-w-0 flex flex-col">
                  <span class="text-sm font-medium"
                        [ngClass]="{
                          'text-indigo-600': step.current,
                          'text-green-600': step.completed,
                          'text-gray-500': !step.current && !step.completed
                        }">
                    {{step.title}}
                  </span>
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <!-- Form Content -->
        <div class="bg-white shadow-lg rounded-lg p-6 sm:p-8">
          
          <!-- Step 1: Personal Information -->
          <div *ngIf="currentStep === 1">
            <app-personal-info-step></app-personal-info-step>
          </div>

          <!-- Step 2: Academic History -->
          <div *ngIf="currentStep === 2">
            <app-academic-history-step></app-academic-history-step>
          </div>

          <!-- Step 3: Contact Information -->
          <div *ngIf="currentStep === 3">
            <app-contact-info-step></app-contact-info-step>
          </div>

          <!-- Step 4: Documents -->
          <div *ngIf="currentStep === 4">
            <app-documents-step></app-documents-step>
          </div>

          <!-- Step 5: Review -->
          <div *ngIf="currentStep === 5">
            <app-review-step></app-review-step>
          </div>

          <!-- Debug Section (Development Only) -->
          <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 class="text-sm font-medium text-yellow-800 mb-2">Debug Authentication (Dev Only)</h4>
            <div class="flex space-x-2">
              <button type="button" 
                      (click)="debugAuth()"
                      class="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700">
                Log Auth Info
              </button>
              <button type="button" 
                      (click)="testAuthStatus()"
                      class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                Test Auth Status
              </button>
              <button type="button" 
                      (click)="testSubmitEndpoint()"
                      class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                Test Submit Endpoint
              </button>
              <button type="button" 
                      (click)="diagnoseAndFix()"
                      class="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700">
                Auto-Fix Auth
              </button>
              <button type="button" 
                      (click)="testJsonSubmission()"
                      class="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700">
                Test JSON Submit
              </button>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <!-- Message d'erreur -->
          <div *ngIf="submissionError" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="ml-3">
                <p class="text-sm text-red-800">{{submissionError}}</p>
              </div>
            </div>
          </div>

          <div class="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button type="button"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    [disabled]="currentStep === 1 || isSubmitting"
                    (click)="previousStep()">
              <svg class="mr-2 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              Précédent
            </button>

            <button type="button"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    [ngClass]="{
                      'bg-indigo-600 hover:bg-indigo-700': currentStep < 5 && !isSubmitting,
                      'bg-green-600 hover:bg-green-700': currentStep === 5 && !isSubmitting,
                      'bg-gray-400': isSubmitting
                    }"
                    [disabled]="isSubmitting"
                    (click)="nextStep()">
              
              <!-- Spinner de chargement -->
              <svg *ngIf="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              
              {{isSubmitting ? 'Soumission en cours...' : (currentStep === 5 ? 'Soumettre' : 'Suivant')}}
              
              <svg *ngIf="currentStep < 5 && !isSubmitting" class="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
              </svg>
              <svg *ngIf="currentStep === 5 && !isSubmitting" class="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Auto-save Indicator -->
        <div class="mt-4 flex justify-center">
          <app-auto-save-indicator></app-auto-save-indicator>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <app-success-modal 
      [isVisible]="showSuccessModal"
      [applicationId]="submittedApplicationId"
      (close)="onCloseSuccessModal()"
      (viewDashboard)="onViewDashboard()">
    </app-success-modal>
  `
})
export class RegistrationWizardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  steps: RegistrationStep[] = [];
  currentStep = 1;
  progress = 0;
  isSubmitting = false;
  submissionError: string | null = null;
  autoSaveStatus: any = { status: 'idle' };
  showSuccessModal = false;
  submittedApplicationId: number | null = null;

  constructor(
    private registrationService: RegistrationFormService,
    private applicationService: ApplicationService,
    private router: Router,
    private authDebugService: AuthDebugService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Recharger les données après authentification
    this.registrationService.reloadAfterAuth();
    
    // Load user profile data first
    this.loadUserProfileData();
    
    this.registrationService.steps$
      .pipe(takeUntil(this.destroy$))
      .subscribe(steps => {
        this.steps = steps;
        this.currentStep = this.registrationService.getCurrentStep();
        this.progress = this.registrationService.calculateProgress();
      });

    // Observer le statut de sauvegarde automatique
    this.registrationService.getAutoSaveStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.autoSaveStatus = status;
      });
  }

  private loadUserProfileData(): void {
    console.log('Loading user profile data for form pre-filling...');
    
    this.registrationService.loadUserProfileData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (userData) => {
          console.log('✅ User profile data loaded and form pre-filled:', userData);
        },
        error: (error) => {
          console.warn('⚠️ Could not load user profile data:', error);
          // Continue with empty form if profile loading fails
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToStep(stepId: number): void {
    this.registrationService.goToStep(stepId);
    
    // Si on navigue vers l'étape documents, restaurer les fichiers
    if (stepId === 4) {
      setTimeout(() => {
        this.restoreDocumentFiles();
      }, 100);
    }
  }

  nextStep(): void {
    if (this.currentStep === 5) {
      this.submitApplication();
    } else {
      const nextStepId = this.currentStep + 1;
      this.registrationService.nextStep();
      
      // Si on navigue vers l'étape documents, restaurer les fichiers
      if (nextStepId === 4) {
        setTimeout(() => {
          this.restoreDocumentFiles();
        }, 100);
      }
    }
  }

  previousStep(): void {
    const prevStepId = this.currentStep - 1;
    this.registrationService.previousStep();
    
    // Si on navigue vers l'étape documents, restaurer les fichiers
    if (prevStepId === 4) {
      setTimeout(() => {
        this.restoreDocumentFiles();
      }, 100);
    }
  }

  private submitApplication(): void {
    this.isSubmitting = true;
    this.submissionError = null;
    
    // Forcer une sauvegarde avant soumission
    this.registrationService.forceSave();
    
    const formData = this.registrationService.getFormData();
    console.log('Submitting application...', formData);
    
    // Valider les données avant soumission
    const validationErrors = this.validateFormData(formData);
    if (validationErrors.length > 0) {
      this.submissionError = 'Données manquantes: ' + validationErrors.join(', ');
      this.isSubmitting = false;
      return;
    }
    
    // Transformer les données du formulaire en format attendu par l'API
    const applicationRequest = this.transformFormDataToRequest(formData);
    const documentRequests = this.transformDocumentsToRequests(formData.documents);
    
    console.log('Debug - Documents from form:', formData.documents);
    console.log('Debug - Transformed document requests:', documentRequests);
    console.log('Debug - Will use multipart?', documentRequests && documentRequests.length > 0);
    
    this.applicationService.submitApplication(applicationRequest, documentRequests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Application submitted successfully:', response);
          this.isSubmitting = false;
          
          // Afficher le modal de succès
          this.submittedApplicationId = response.id || response.applicationId || null;
          this.showSuccessModal = true;
          
          // Vérifier l'espace de stockage avant nettoyage
          const storageInfo = this.registrationService.checkStorageSpace();
          if (storageInfo.percentage > 90) {
            console.warn('Espace de stockage critique, nettoyage nécessaire');
          }
          
          // Nettoyer les données du formulaire
          this.registrationService.clearFormData();
        },
        error: (error) => {
          console.error('Error submitting application:', error);
          this.isSubmitting = false;
          
          // Gestion spéciale des erreurs 401
          if (error.status === 401) {
            this.submissionError = 'Session expirée. Veuillez vous reconnecter.';
            
            // Proposer une reconnexion automatique
            setTimeout(() => {
              const shouldReconnect = confirm('Votre session a expiré. Voulez-vous vous reconnecter pour continuer ?');
              if (shouldReconnect) {
                this.forceReconnect();
              }
            }, 2000);
          } else if (error.status === 409 && error.error?.code === 'ALREADY_SUBMITTED') {
            // Gestion spéciale pour candidature déjà soumise
            const errorData = error.error;
            this.submissionError = errorData.message + '\n\n' + errorData.details;
            
            if (errorData.canSubmitOther) {
              this.submissionError += '\n\nVous pouvez soumettre une candidature pour un autre établissement.';
              
              // Proposer de vider le formulaire pour une nouvelle candidature
              setTimeout(() => {
                const shouldReset = confirm('Voulez-vous vider le formulaire pour soumettre une candidature à un autre établissement ?');
                if (shouldReset) {
                  this.registrationService.clearFormData();
                  this.router.navigate(['/registration']);
                }
              }, 3000);
            }
          } else {
            this.submissionError = error.error?.message || 'Erreur lors de la soumission. Veuillez réessayer.';
          }
          
          // Créer une sauvegarde d'urgence en cas d'erreur
          console.log('Création d\'une sauvegarde d\'urgence...');
          // La sauvegarde d'urgence est gérée automatiquement par le service
        }
      });
  }
  
  private transformFormDataToRequest(formData: RegistrationFormData): ApplicationSubmissionRequest {
    console.log('Transforming form data:', formData);
    
    return {
      personalInfo: {
        lastName: formData.personalInfo.lastName || '',
        firstNames: formData.personalInfo.firstNames || [''],
        gender: (formData.personalInfo.gender || 'M') as 'M' | 'F' | 'NON_BINARY',
        birthDate: formData.personalInfo.birthDate || '',
        nationality: formData.personalInfo.nationality || '',
        idType: (formData.personalInfo.idType || 'CNI') as 'CNI' | 'PASSPORT' | 'BIRTH_CERTIFICATE'
      },
      contactInfo: {
        email: formData.contactInfo.email || '',
        emailConfirm: formData.contactInfo.emailConfirm || formData.contactInfo.email || '',
        countryCode: formData.contactInfo.countryCode || '+237',
        phone: formData.contactInfo.phone || '',
        address: {
          street: formData.contactInfo.address?.street || '',
          city: formData.contactInfo.address?.city || '',
          postalCode: formData.contactInfo.address?.postalCode || '',
          country: formData.contactInfo.address?.country || ''
        },
        emergencyContact: {
          name: formData.contactInfo.emergencyContact?.name || '',
          relationship: formData.contactInfo.emergencyContact?.relationship || '',
          phone: formData.contactInfo.emergencyContact?.phone || ''
        },
        emailNotifications: formData.contactInfo.emailNotifications !== false,
        smsNotifications: formData.contactInfo.smsNotifications === true
      },
      academicHistory: {
        lastInstitution: formData.academicHistory.lastInstitution || '',
        specialization: formData.academicHistory.specialization || '',
        subSpecialization: formData.academicHistory.subSpecialization || '',
        startDate: formData.academicHistory.startDate || '',
        endDate: formData.academicHistory.endDate || '',
        educationLevel: formData.academicHistory.educationLevel || '',
        gpa: formData.academicHistory.gpa || undefined,
        honors: formData.academicHistory.honors || []
      },
      targetInstitution: formData.academicHistory.lastInstitution || 'Institution par défaut',
      specialization: formData.academicHistory.specialization || 'Spécialisation par défaut'
    };
  }
  
  private transformDocumentsToRequests(documents: any): DocumentUploadRequest[] | undefined {
    if (!documents) {
      return undefined;
    }
    
    const documentRequests: DocumentUploadRequest[] = [];
    
    if (documents.baccalaureate) {
      documentRequests.push({
        documentType: 'BACCALAUREATE',
        file: documents.baccalaureate
      });
    }
    
    if (documents.higherDiplomas && documents.higherDiplomas.length > 0) {
      documents.higherDiplomas.forEach((diploma: File, index: number) => {
        documentRequests.push({
          documentType: `HIGHER_DIPLOMA_${index + 1}`,
          file: diploma
        });
      });
    }
    
    if (documents.idCardFront) {
      documentRequests.push({
        documentType: 'ID_CARD_FRONT',
        file: documents.idCardFront
      });
    }
    
    if (documents.idCardBack) {
      documentRequests.push({
        documentType: 'ID_CARD_BACK',
        file: documents.idCardBack
      });
    }
    
    if (documents.birthCertificate) {
      documentRequests.push({
        documentType: 'BIRTH_CERTIFICATE',
        file: documents.birthCertificate
      });
    }
    
    if (documents.identityPhoto) {
      documentRequests.push({
        documentType: 'IDENTITY_PHOTO',
        file: documents.identityPhoto
      });
    }
    
    return documentRequests.length > 0 ? documentRequests : undefined;
  }

  /**
   * Restaurer les fichiers lors de la navigation vers l'étape documents
   */
  private restoreDocumentFiles(): void {
    console.log('Tentative de restauration des fichiers documents...');
    
    // Forcer la restauration des fichiers depuis le service
    this.registrationService.restoreFiles();
    
    // Vérifier si des fichiers ont été restaurés
    const hasStoredFiles = this.registrationService.hasStoredFiles();
    if (hasStoredFiles) {
      console.log('✅ Fichiers restaurés avec succès');
    } else {
      console.log('⚠️ Aucun fichier à restaurer');
    }
  }

  /**
   * Fonctions de debug pour diagnostiquer les problèmes d'authentification
   */
  debugAuth(): void {
    this.authDebugService.logDebugInfo();
  }

  testAuthStatus(): void {
    this.authDebugService.checkAuthStatus().subscribe({
      next: (response) => {
        console.log('✅ Auth Status Response:', response);
        alert('Auth Status OK: ' + JSON.stringify(response));
      },
      error: (error) => {
        console.log('❌ Auth Status Error:', error);
        alert('Auth Status Error: ' + error.status + ' - ' + error.message);
      }
    });
  }

  testSubmitEndpoint(): void {
    this.authDebugService.testSubmitEndpoint().subscribe({
      next: (response) => {
        console.log('✅ Submit Test Response:', response);
        alert('Submit Test OK: ' + JSON.stringify(response));
      },
      error: (error) => {
        console.log('❌ Submit Test Error:', error);
        alert('Submit Test Error: ' + error.status + ' - ' + error.message);
        
        // Si erreur 401, proposer une reconnexion
        if (error.status === 401) {
          const shouldReconnect = confirm('Erreur d\'authentification détectée. Voulez-vous vous reconnecter ?');
          if (shouldReconnect) {
            this.forceReconnect();
          }
        }
      }
    });
  }

  /**
   * Diagnostiquer et réparer automatiquement les problèmes d'authentification
   */
  diagnoseAndFix(): void {
    this.authDebugService.diagnoseAndFix().subscribe({
      next: (response) => {
        console.log('✅ Diagnostic et réparation:', response);
        if (response.message && response.message.includes('créé')) {
          alert('Utilisateur créé avec succès! Vous pouvez maintenant soumettre le formulaire.');
        } else {
          alert('Diagnostic terminé: ' + JSON.stringify(response));
        }
      },
      error: (error) => {
        console.log('❌ Erreur de diagnostic:', error);
        alert('Erreur de diagnostic: ' + error.status + ' - ' + error.message);
      }
    });
  }

  /**
   * Tester la soumission JSON
   */
  testJsonSubmission(): void {
    const testData = {
      test: true,
      message: 'Test de soumission JSON',
      timestamp: new Date().toISOString()
    };
    
    this.applicationService.testJsonSubmission(testData).subscribe({
      next: (response) => {
        console.log('✅ Test JSON Response:', response);
        alert('Test JSON OK: ' + JSON.stringify(response));
      },
      error: (error) => {
        console.log('❌ Test JSON Error:', error);
        alert('Test JSON Error: ' + error.status + ' - ' + (error.error?.message || error.message));
      }
    });
  }

  /**
   * Forcer une reconnexion en cas de problème d'authentification
   */
  private forceReconnect(): void {
    // Sauvegarder les données du formulaire avant la déconnexion
    this.registrationService.forceSave();
    
    // Nettoyer l'authentification
    localStorage.removeItem('authToken');
    
    // Rediriger vers la page de connexion
    this.router.navigate(['/auth/login'], {
      queryParams: {
        returnUrl: '/registration',
        message: 'Veuillez vous reconnecter pour continuer'
      }
    });
  }

  /**
   * Fermer le modal de succès
   */
  onCloseSuccessModal(): void {
    this.showSuccessModal = false;
    this.submittedApplicationId = null;
  }

  /**
   * Rediriger vers le dashboard depuis le modal
   */
  onViewDashboard(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/dashboard']);
  }

  /**
   * Valider les données du formulaire avant soumission
   */
  private validateFormData(formData: RegistrationFormData): string[] {
    const errors: string[] = [];
    
    // Validation informations personnelles
    if (!formData.personalInfo.lastName?.trim()) {
      errors.push('Nom de famille');
    }
    if (!formData.personalInfo.firstNames?.[0]?.trim()) {
      errors.push('Prénom');
    }
    if (!formData.personalInfo.gender) {
      errors.push('Sexe');
    }
    if (!formData.personalInfo.birthDate) {
      errors.push('Date de naissance');
    }
    if (!formData.personalInfo.nationality?.trim()) {
      errors.push('Nationalité');
    }
    
    // Validation coordonnées
    if (!formData.contactInfo.email?.trim()) {
      errors.push('Email');
    }
    if (!formData.contactInfo.phone?.trim()) {
      errors.push('Téléphone');
    }
    
    // Validation parcours académique
    if (!formData.academicHistory.lastInstitution?.trim()) {
      errors.push('Établissement');
    }
    if (!formData.academicHistory.specialization?.trim()) {
      errors.push('Spécialisation');
    }
    if (!formData.academicHistory.educationLevel?.trim()) {
      errors.push('Niveau d\'\u00e9tudes');
    }
    
    return errors;
  }
}
