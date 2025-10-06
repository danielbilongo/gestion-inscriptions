import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService } from './user.service';
import { AutoSaveService } from './auto-save.service';

export interface RegistrationStep {
  id: number;
  title: string;
  completed: boolean;
  current: boolean;
  valid: boolean;
}

export interface PersonalInfo {
  lastName: string;
  firstNames: string[];
  gender: 'M' | 'F' | 'NON_BINARY' | '';
  birthDate: string;
  nationality: string;
  idType: 'CNI' | 'PASSPORT' | 'BIRTH_CERTIFICATE' | '';
}

export interface Documents {
  baccalaureate?: File;
  higherDiplomas: File[];
  idCardFront?: File;
  idCardBack?: File;
  birthCertificate?: File;
  identityPhoto?: File;
}

export interface AcademicHistory {
  lastInstitution: string;
  specialization: string;
  subSpecialization?: string;
  startDate: string;
  endDate: string;
  educationLevel: string;
  gpa?: number;
  honors?: string[];
}

export interface ContactInfo {
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
}

export interface RegistrationFormData {
  personalInfo: PersonalInfo;
  documents: Documents;
  academicHistory: AcademicHistory;
  contactInfo: ContactInfo;
  review: any;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationFormService {
  private readonly STORAGE_KEY = 'registration_form_data';
  
  private stepsSubject = new BehaviorSubject<RegistrationStep[]>([
    { id: 1, title: 'Informations Personnelles', completed: false, current: true, valid: false },
    { id: 2, title: 'Parcours Académique', completed: false, current: false, valid: false },
    { id: 3, title: 'Coordonnées', completed: false, current: false, valid: false },
    { id: 4, title: 'Documents Officiels', completed: false, current: false, valid: false },
    { id: 5, title: 'Révision', completed: false, current: false, valid: false }
  ]);

  private formDataSubject = new BehaviorSubject<RegistrationFormData>({
    personalInfo: {
      lastName: '',
      firstNames: [''],
      gender: '' as 'M' | 'F' | 'NON_BINARY' | '',
      birthDate: '',
      nationality: '',
      idType: '' as 'CNI' | 'PASSPORT' | 'BIRTH_CERTIFICATE' | ''
    },
    documents: {
      higherDiplomas: []
    },
    academicHistory: {
      lastInstitution: '',
      specialization: '',
      subSpecialization: '',
      startDate: '',
      endDate: '',
      educationLevel: '',
      gpa: undefined,
      honors: []
    },
    contactInfo: {
      email: '',
      emailConfirm: '',
      countryCode: '',
      phone: '',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: ''
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },
      emailNotifications: true,
      smsNotifications: false
    },
    review: {}
  });

  public steps$ = this.stepsSubject.asObservable();
  public formData$ = this.formDataSubject.asObservable();

  constructor(
    private userService: UserService,
    private autoSaveService: AutoSaveService
  ) {
    // Attendre un peu pour que l'authentification soit complète
    setTimeout(() => {
      this.loadFromStorage();
      this.setupAutoSave();
    }, 100);
  }

  getCurrentStep(): number {
    const steps = this.stepsSubject.value;
    return steps.find(step => step.current)?.id || 1;
  }

  goToStep(stepId: number): void {
    const steps = this.stepsSubject.value.map(step => ({
      ...step,
      current: step.id === stepId
    }));
    this.stepsSubject.next(steps);
  }

  nextStep(): void {
    const currentStep = this.getCurrentStep();
    if (currentStep < 5) {
      this.markStepCompleted(currentStep);
      this.goToStep(currentStep + 1);
    }
  }

  previousStep(): void {
    const currentStep = this.getCurrentStep();
    if (currentStep > 1) {
      this.goToStep(currentStep - 1);
    }
  }

  markStepCompleted(stepId: number): void {
    const steps = this.stepsSubject.value.map(step => 
      step.id === stepId ? { ...step, completed: true, valid: true } : step
    );
    this.stepsSubject.next(steps);
  }

  markStepValid(stepId: number, valid: boolean): void {
    const steps = this.stepsSubject.value.map(step => 
      step.id === stepId ? { ...step, valid } : step
    );
    this.stepsSubject.next(steps);
  }

  updateFormData(section: keyof RegistrationFormData, data: any): void {
    const currentData = this.formDataSubject.value;
    
    // Gestion spéciale pour les documents pour préserver les fichiers existants
    if (section === 'documents') {
      const updatedData = {
        ...currentData,
        documents: { ...currentData.documents, ...data }
      };
      this.formDataSubject.next(updatedData);
      console.log('Mise à jour des documents:', updatedData.documents);
    } else {
      const updatedData = {
        ...currentData,
        [section]: { ...currentData[section], ...data }
      };
      this.formDataSubject.next(updatedData);
    }
    
    // Sauvegarde automatique avec gestion des fichiers
    this.saveFormDataWithFiles(this.formDataSubject.value);
  }

  getFormData(): RegistrationFormData {
    return this.formDataSubject.value;
  }

  private saveToStorage(): void {
    this.saveFormDataWithFiles(this.formDataSubject.value);
  }

  private saveFormDataWithFiles(data: RegistrationFormData): void {
    try {
      // Séparer les fichiers des autres données
      const { documents, ...dataWithoutFiles } = data;
      
      // Sauvegarder les données sans fichiers avec AutoSaveService (spécifique à l'utilisateur)
      this.autoSaveService.saveData('registration_form_data', dataWithoutFiles);
      
      // Sauvegarder les métadonnées des fichiers
      const fileMetadata = this.extractFileMetadata(documents);
      this.autoSaveService.saveData('registration_form_files', fileMetadata);
      
      // Sauvegarder les fichiers en tant que base64 (pour les petits fichiers)
      this.saveFilesToStorage(documents);
      
    } catch (error) {
      console.warn('Failed to save form data:', error);
      this.autoSaveService.createEmergencyBackup('registration_form', data);
    }
  }

  private extractFileMetadata(documents: Documents): any {
    const metadata: any = {};
    
    if (documents.baccalaureate) {
      metadata.baccalaureate = {
        name: documents.baccalaureate.name,
        size: documents.baccalaureate.size,
        type: documents.baccalaureate.type,
        lastModified: documents.baccalaureate.lastModified
      };
    }
    
    if (documents.higherDiplomas?.length > 0) {
      metadata.higherDiplomas = documents.higherDiplomas.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }));
    }
    
    ['idCardFront', 'idCardBack', 'birthCertificate', 'identityPhoto'].forEach(key => {
      const file = documents[key as keyof Documents] as File;
      if (file) {
        metadata[key] = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        };
      }
    });
    
    return metadata;
  }

  private async saveFilesToStorage(documents: Documents): Promise<void> {
    const filePromises: Promise<void>[] = [];
    
    // Nettoyer les anciens fichiers avant de sauvegarder les nouveaux
    this.clearOldFiles();
    
    // Sauvegarder chaque fichier en base64 (limité aux fichiers < 2MB)
    Object.entries(documents).forEach(([key, value]) => {
      if (value instanceof File && value.size < 2 * 1024 * 1024) { // < 2MB
        filePromises.push(this.saveFileAsBase64(key, value));
      } else if (Array.isArray(value) && value.length > 0) {
        value.forEach((file, index) => {
          if (file instanceof File && file.size < 2 * 1024 * 1024) {
            filePromises.push(this.saveFileAsBase64(`${key}_${index}`, file));
          }
        });
      }
    });
    
    try {
      await Promise.all(filePromises);
      console.log('Tous les fichiers ont été sauvegardés avec succès');
    } catch (error) {
      console.warn('Certains fichiers n\'ont pas pu être sauvegardés:', error);
    }
  }

  private saveFileAsBase64(key: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          this.autoSaveService.saveData(`registration_file_${key}`, reader.result as string);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private loadFromStorage(): void {
    try {
      // Charger les données sans fichiers depuis AutoSaveService
      const data = this.autoSaveService.loadData('registration_form_data');
      if (data) {
        // Charger les fichiers sauvegardés
        const documents = this.loadFilesFromStorage();
        
        const completeData = {
          ...this.formDataSubject.value,
          ...data,
          documents: { ...this.formDataSubject.value.documents, ...documents }
        };
        
        this.formDataSubject.next(completeData);
      }
    } catch (error) {
      console.warn('Failed to load form data from storage:', error);
    }
  }

  private loadFilesFromStorage(): Partial<Documents> {
    const documents: Partial<Documents> = { higherDiplomas: [] };
    
    try {
      const metadata = this.autoSaveService.loadData('registration_form_files');
      if (!metadata) {
        console.log('Aucune métadonnée de fichier trouvée');
        return documents;
      }
      
      console.log('Chargement des fichiers depuis le stockage:', metadata);
      
      // Reconstruire les fichiers depuis base64
      Object.entries(metadata).forEach(([key, meta]: [string, any]) => {
        if (key === 'higherDiplomas' && Array.isArray(meta)) {
          documents.higherDiplomas = [];
          meta.forEach((fileMeta, index) => {
            const base64Data = this.autoSaveService.loadData(`registration_file_${key}_${index}`);
            if (base64Data && typeof base64Data === 'string') {
              try {
                const file = this.base64ToFile(base64Data, fileMeta.name, fileMeta.type);
                documents.higherDiplomas!.push(file);
                console.log(`Fichier ${fileMeta.name} restauré avec succès`);
              } catch (error) {
                console.warn(`Erreur lors de la restauration du fichier ${fileMeta.name}:`, error);
              }
            }
          });
        } else if (meta && meta.name) {
          const base64Data = this.autoSaveService.loadData(`registration_file_${key}`);
          if (base64Data && typeof base64Data === 'string') {
            try {
              const file = this.base64ToFile(base64Data, meta.name, meta.type);
              (documents as any)[key] = file;
              console.log(`Fichier ${meta.name} restauré avec succès pour ${key}`);
            } catch (error) {
              console.warn(`Erreur lors de la restauration du fichier ${meta.name}:`, error);
            }
          }
        }
      });
      
    } catch (error) {
      console.warn('Échec du chargement des fichiers depuis le stockage:', error);
    }
    
    return documents;
  }

  private base64ToFile(base64Data: string, fileName: string, fileType: string): File {
    const byteCharacters = atob(base64Data.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], fileName, { type: fileType });
  }

  clearFormData(): void {
    // Nettoyer toutes les données y compris les fichiers via AutoSaveService
    this.autoSaveService.clearData('registration_form_data');
    this.autoSaveService.clearData('registration_form_files');
    this.autoSaveService.clearData('registration_form');
    
    const emptyData = {
      personalInfo: {
        lastName: '',
        firstNames: [''],
        gender: '' as 'M' | 'F' | 'NON_BINARY' | '',
        birthDate: '',
        nationality: '',
        idType: '' as 'CNI' | 'PASSPORT' | 'BIRTH_CERTIFICATE' | ''
      },
      documents: {
        higherDiplomas: []
      },
      academicHistory: {
        lastInstitution: '',
        specialization: '',
        subSpecialization: '',
        startDate: '',
        endDate: '',
        educationLevel: '',
        gpa: undefined,
        honors: []
      },
      contactInfo: {
        email: '',
        emailConfirm: '',
        countryCode: '',
        phone: '',
        address: {
          street: '',
          city: '',
          postalCode: '',
          country: ''
        },
        emergencyContact: {
          name: '',
          relationship: '',
          phone: ''
        },
        emailNotifications: true,
        smsNotifications: false
      },
      review: {}
    };
    
    this.formDataSubject.next(emptyData);
  }

  calculateProgress(): number {
    const steps = this.stepsSubject.value;
    const completedSteps = steps.filter(step => step.completed).length;
    return Math.round((completedSteps / steps.length) * 100);
  }

  /**
   * Load user profile data and pre-fill the form
   */
  loadUserProfileData(): Observable<any> {
    return new Observable(observer => {
      // Essayer d'abord l'endpoint OAuth2, puis l'endpoint utilisateur normal
      this.userService.getOAuth2UserFormData().subscribe({
        next: (userData) => {
          console.log('User profile data loaded:', userData);
          
          // Merge user data with current form data, preserving any existing form data
          const currentData = this.formDataSubject.value;
          const mergedData = {
            ...currentData,
            personalInfo: { ...currentData.personalInfo, ...userData.personalInfo },
            contactInfo: { ...currentData.contactInfo, ...userData.contactInfo },
            // Keep academic history and documents as they are (user needs to fill these)
            academicHistory: currentData.academicHistory,
            documents: currentData.documents,
            review: currentData.review
          };
          
          this.formDataSubject.next(mergedData);
          this.saveToStorage();
          
          observer.next(userData);
          observer.complete();
        },
        error: (error) => {
          console.error('Error loading user profile data:', error);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Reset form to user profile data (clear any manual changes)
   */
  resetToUserProfile(): Observable<any> {
    return new Observable(observer => {
      this.userService.getCurrentUserFormData().subscribe({
        next: (userData) => {
          console.log('Resetting form to user profile data:', userData);
          this.formDataSubject.next(userData);
          this.saveToStorage();
          
          observer.next(userData);
          observer.complete();
        },
        error: (error) => {
          console.error('Error resetting to user profile data:', error);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Configuration de la sauvegarde automatique
   */
  private setupAutoSave(): void {
    // Sauvegarde automatique avec debounce
    this.autoSaveService.autoSave('registration_form', this.formData$)
      .subscribe({
        next: (data) => {
          console.log('Données sauvegardées automatiquement');
        },
        error: (error) => {
          console.error('Erreur de sauvegarde automatique:', error);
          // Créer une sauvegarde d'urgence
          this.autoSaveService.createEmergencyBackup('registration_form', this.formDataSubject.value);
        }
      });
    
    // Nettoyage automatique des anciennes données au démarrage
    this.autoSaveService.cleanupOldData();
  }

  /**
   * Obtenir le statut de sauvegarde automatique
   */
  getAutoSaveStatus(): Observable<any> {
    return this.autoSaveService.status$;
  }

  /**
   * Forcer une sauvegarde immédiate
   */
  forceSave(): void {
    this.autoSaveService.saveData('registration_form', this.formDataSubject.value);
  }

  /**
   * Vérifier l'espace de stockage
   */
  checkStorageSpace(): { used: number; available: number; percentage: number } {
    return this.autoSaveService.checkStorageSpace();
  }

  /**
   * Recharger les données après authentification
   */
  reloadAfterAuth(): void {
    this.autoSaveService.reloadUserData();
    this.loadFromStorage();
  }

  /**
   * Nettoyer les anciens fichiers avant de sauvegarder les nouveaux
   */
  private clearOldFiles(): void {
    try {
      // Supprimer les anciens fichiers pour éviter les conflits
      const fileKeys = ['baccalaureate', 'idCardFront', 'idCardBack', 'birthCertificate', 'identityPhoto'];
      
      fileKeys.forEach(key => {
        this.autoSaveService.clearData(`registration_file_${key}`);
      });
      
      // Nettoyer les diplômes supérieurs (jusqu'à 10 fichiers max)
      for (let i = 0; i < 10; i++) {
        this.autoSaveService.clearData(`registration_file_higherDiplomas_${i}`);
      }
    } catch (error) {
      console.warn('Erreur lors du nettoyage des anciens fichiers:', error);
    }
  }

  /**
   * Obtenir les fichiers actuellement stockés
   */
  getStoredFiles(): Partial<Documents> {
    return this.loadFilesFromStorage();
  }

  /**
   * Vérifier si des fichiers sont stockés
   */
  hasStoredFiles(): boolean {
    const metadata = this.autoSaveService.loadData('registration_form_files');
    return metadata && Object.keys(metadata).length > 0;
  }

  /**
   * Forcer la restauration des fichiers
   */
  restoreFiles(): void {
    const currentData = this.formDataSubject.value;
    const storedFiles = this.loadFilesFromStorage();
    
    if (Object.keys(storedFiles).length > 0) {
      const updatedData = {
        ...currentData,
        documents: { ...currentData.documents, ...storedFiles }
      };
      
      this.formDataSubject.next(updatedData);
      console.log('Fichiers restaurés:', storedFiles);
    }
  }
}
