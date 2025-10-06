import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InscriptionRequest {
  personalInfo: {
    lastName: string;
    firstNames: string[];
    gender: 'M' | 'F' | 'NON_BINARY';
    birthDate: string;
    nationality: string;
    idType: 'CNI' | 'PASSPORT' | 'BIRTH_CERTIFICATE';
  };
  contactInfo: {
    email: string;
    emailConfirm: string;
    countryCode: string;
    phone: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
    emailNotifications?: boolean;
    smsNotifications?: boolean;
  };
  academicHistory: {
    lastInstitution: string;
    specialization: string;
    subSpecialization?: string;
    startDate: string;
    endDate: string;
    educationLevel: string;
    gpa?: number;
    honors?: string[];
  };
  targetInstitution?: string;
  specialization?: string;
}

export interface InscriptionResponse {
  success: boolean;
  message: string;
  application: {
    applicationId: number;
    status: string;
    completionRate: number;
    submissionDate: string;
    createdAt: string;
    username: string;
    applicantName: string;
  };
  workflow: {
    currentStep: string;
    nextStep: string;
    estimatedProcessingTime: string;
  };
}

export interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  estimatedTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionWorkflowService {
  private apiUrl = `${environment.apiUrl}/inscription`;
  
  // État du workflow
  private workflowStepsSubject = new BehaviorSubject<WorkflowStep[]>([
    { id: 1, title: 'Informations Personnelles', description: 'Nom, prénom, date de naissance', completed: false, current: true, estimatedTime: '3 min' },
    { id: 2, title: 'Parcours Académique', description: 'Établissement, spécialisation', completed: false, current: false, estimatedTime: '5 min' },
    { id: 3, title: 'Coordonnées', description: 'Email, téléphone, adresse', completed: false, current: false, estimatedTime: '4 min' },
    { id: 4, title: 'Documents', description: 'Upload des pièces justificatives', completed: false, current: false, estimatedTime: '8 min' },
    { id: 5, title: 'Révision', description: 'Vérification et soumission', completed: false, current: false, estimatedTime: '2 min' }
  ]);

  public workflowSteps$ = this.workflowStepsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Soumission complète du dossier d'inscription selon le cahier des charges
   */
  submitCompleteInscription(
    inscriptionData: InscriptionRequest,
    documents?: File[]
  ): Observable<InscriptionResponse> {
    console.log('=== SOUMISSION WORKFLOW INSCRIPTION ===');
    console.log('Données:', inscriptionData);
    console.log('Documents:', documents?.length || 0);

    const formData = new FormData();
    
    // Ajouter les données JSON
    formData.append('applicationData', JSON.stringify(inscriptionData));
    
    // Ajouter les documents si présents
    if (documents && documents.length > 0) {
      documents.forEach((file, index) => {
        formData.append('documents', file);
        formData.append('documentNames', file.name);
        formData.append('documentTypes', this.getDocumentType(file.name, index));
      });
    }

    return this.http.post<InscriptionResponse>(`${this.apiUrl}/submit-complete`, formData);
  }

  /**
   * Vérifier le statut d'une inscription
   */
  checkInscriptionStatus(applicationId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/${applicationId}`);
  }

  /**
   * Mettre à jour l'état du workflow
   */
  updateWorkflowStep(stepId: number, completed: boolean = false): void {
    const steps = this.workflowStepsSubject.value.map(step => ({
      ...step,
      completed: step.id < stepId ? true : (step.id === stepId ? completed : step.completed),
      current: step.id === stepId && !completed
    }));
    
    this.workflowStepsSubject.next(steps);
  }

  /**
   * Calculer le pourcentage de progression
   */
  calculateProgress(): number {
    const steps = this.workflowStepsSubject.value;
    const completedSteps = steps.filter(step => step.completed).length;
    const currentStep = steps.find(step => step.current);
    
    let progress = (completedSteps / steps.length) * 100;
    
    // Ajouter un bonus pour l'étape courante
    if (currentStep && !currentStep.completed) {
      progress += (1 / steps.length) * 50; // 50% de l'étape courante
    }
    
    return Math.min(100, Math.round(progress));
  }

  /**
   * Obtenir les informations de l'étape courante
   */
  getCurrentStepInfo(): WorkflowStep | null {
    return this.workflowStepsSubject.value.find(step => step.current) || null;
  }

  /**
   * Passer à l'étape suivante
   */
  goToNextStep(): void {
    const steps = this.workflowStepsSubject.value;
    const currentStepIndex = steps.findIndex(step => step.current);
    
    if (currentStepIndex < steps.length - 1) {
      this.updateWorkflowStep(currentStepIndex + 2); // +2 car les IDs commencent à 1
    }
  }

  /**
   * Revenir à l'étape précédente
   */
  goToPreviousStep(): void {
    const steps = this.workflowStepsSubject.value;
    const currentStepIndex = steps.findIndex(step => step.current);
    
    if (currentStepIndex > 0) {
      this.updateWorkflowStep(currentStepIndex); // currentStepIndex car les IDs commencent à 1
    }
  }

  /**
   * Aller à une étape spécifique
   */
  goToStep(stepId: number): void {
    this.updateWorkflowStep(stepId);
  }

  /**
   * Marquer une étape comme complétée
   */
  completeStep(stepId: number): void {
    this.updateWorkflowStep(stepId, true);
  }

  /**
   * Réinitialiser le workflow
   */
  resetWorkflow(): void {
    const resetSteps = this.workflowStepsSubject.value.map((step, index) => ({
      ...step,
      completed: false,
      current: index === 0
    }));
    
    this.workflowStepsSubject.next(resetSteps);
  }

  /**
   * Déterminer le type de document basé sur le nom du fichier
   */
  private getDocumentType(fileName: string, index: number): string {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('bac') || lowerName.includes('baccalaureat')) {
      return 'BACCALAUREATE';
    }
    if (lowerName.includes('diplome') || lowerName.includes('diploma')) {
      return `HIGHER_DIPLOMA_${index + 1}`;
    }
    if (lowerName.includes('cni') || lowerName.includes('carte') || lowerName.includes('id')) {
      return lowerName.includes('verso') || lowerName.includes('back') ? 'ID_CARD_BACK' : 'ID_CARD_FRONT';
    }
    if (lowerName.includes('naissance') || lowerName.includes('birth')) {
      return 'BIRTH_CERTIFICATE';
    }
    if (lowerName.includes('photo') || lowerName.includes('identite')) {
      return 'IDENTITY_PHOTO';
    }
    
    return `DOCUMENT_${index + 1}`;
  }

  /**
   * Valider les données avant soumission
   */
  validateInscriptionData(data: InscriptionRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validation informations personnelles
    if (!data.personalInfo?.lastName?.trim()) {
      errors.push('Le nom de famille est requis');
    }
    if (!data.personalInfo?.firstNames?.length || !data.personalInfo.firstNames[0]?.trim()) {
      errors.push('Au moins un prénom est requis');
    }
    if (!data.personalInfo?.birthDate) {
      errors.push('La date de naissance est requise');
    }
    if (!data.personalInfo?.nationality?.trim()) {
      errors.push('La nationalité est requise');
    }

    // Validation coordonnées
    if (!data.contactInfo?.email?.trim()) {
      errors.push('L\'email est requis');
    }
    if (data.contactInfo?.email !== data.contactInfo?.emailConfirm) {
      errors.push('Les emails ne correspondent pas');
    }
    if (!data.contactInfo?.phone?.trim()) {
      errors.push('Le numéro de téléphone est requis');
    }

    // Validation parcours académique
    if (!data.academicHistory?.lastInstitution?.trim()) {
      errors.push('Le dernier établissement est requis');
    }
    if (!data.academicHistory?.specialization?.trim()) {
      errors.push('La spécialisation est requise');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtenir les statistiques du workflow
   */
  getWorkflowStats(): { totalSteps: number; completedSteps: number; currentStep: number; progress: number } {
    const steps = this.workflowStepsSubject.value;
    const completedSteps = steps.filter(step => step.completed).length;
    const currentStep = steps.find(step => step.current)?.id || 1;
    
    return {
      totalSteps: steps.length,
      completedSteps,
      currentStep,
      progress: this.calculateProgress()
    };
  }
}