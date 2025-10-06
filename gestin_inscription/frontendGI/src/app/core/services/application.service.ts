import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FormValidationService } from './form-validation.service';
import { InscriptionWorkflowService, InscriptionRequest } from './inscription-workflow.service';

export interface ApplicationSubmissionRequest {
  personalInfo: {
    lastName: string;
    firstNames: string[]; // Array de prénoms (sera concaténé pour le backend)
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

export interface ApplicationStatusResponse {
  id?: number;
  applicationId?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  submissionDate: string;
  lastModified?: string;
  candidateName?: string;
  email?: string;
  success?: boolean;
  message?: string;
}

export interface DocumentUploadRequest {
  documentType: string;
  file: File;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = `${environment.apiUrl}/applications`;

  constructor(
    private http: HttpClient,
    private validationService: FormValidationService,
    private inscriptionWorkflowService: InscriptionWorkflowService
  ) {}

  /**
   * Soumettre une nouvelle candidature (format complet) - NOUVEAU WORKFLOW
   * POST /api/inscription/submit-complete
   */
  submitApplication(
    applicationData: ApplicationSubmissionRequest,
    documents?: DocumentUploadRequest[]
  ): Observable<ApplicationStatusResponse> {
    console.log('=== SOUMISSION AVEC NOUVEAU WORKFLOW ===');
    console.log('Documents à envoyer:', documents?.length || 0);
    
    // Utiliser l'endpoint de soumission d'applications
    const formData = new FormData();
    
    // Ajouter les données du formulaire en JSON
    formData.append('applicationData', JSON.stringify(applicationData));
    
    // Ajouter les documents si présents
    if (documents && documents.length > 0) {
      const documentNames: string[] = [];
      const documentTypes: string[] = [];
      
      documents.forEach((doc) => {
        formData.append('files', doc.file);
        documentNames.push(doc.file.name);
        documentTypes.push(doc.documentType);
      });
      
      // Ajouter les métadonnées des documents
      documentNames.forEach(name => formData.append('documentNames', name));
      documentTypes.forEach(type => formData.append('documentTypes', type));
    }

    // Utiliser l'endpoint correct
    return this.http.post<ApplicationStatusResponse>(`${this.apiUrl}/submit`, formData);
  }

  /**
   * Soumettre candidature avec fichiers séparés (nouvelle méthode)
   */
  submitApplicationSimple(
    files: File[],
    documentTypes: string[]
  ): Observable<ApplicationStatusResponse> {
    const formData = new FormData();
    
    files.forEach(file => formData.append('files', file));
    documentTypes.forEach(type => formData.append('documentTypes', type));
    files.forEach(file => formData.append('documentNames', file.name));

    return this.http.post<ApplicationStatusResponse>(`${this.apiUrl}/submit`, formData);
  }


  /**
   * Obtenir les candidatures par statut pour l'utilisateur courant
   * GET /api/applications/status/{status}
   */
  getApplicationsByStatus(status: string): Observable<ApplicationStatusResponse[]> {
    return this.http.get<ApplicationStatusResponse[]>(`${this.apiUrl}/status/${status}`);
  }

  /**
   * Obtenir toutes les candidatures (SUPER_ADMIN seulement)
   * GET /api/applications/all
   */
  getAllApplications(): Observable<ApplicationStatusResponse[]> {
    return this.http.get<ApplicationStatusResponse[]>(`${this.apiUrl}/all`);
  }

  /**
   * Upload d'un document pour une candidature
   * POST /api/documents/upload/{applicationId}
   */
  uploadDocument(applicationId: number, documentType: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);

    return this.http.post(`${environment.apiUrl}/documents/upload/${applicationId}`, formData);
  }

  /**
   * Test de soumission JSON
   * POST /api/applications/test-json
   */
  testJsonSubmission(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/test-json`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
