import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  suggestions?: string[];
}

export interface FieldValidationRequest {
  field: string;
  value: any;
  context?: any;
}

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  constructor(private http: HttpClient) {}

  /**
   * Validation côté serveur d'un champ spécifique
   */
  validateField(field: string, value: any, context?: any): Observable<ValidationResult> {
    // Simulation de validation côté serveur
    return new Observable(observer => {
      setTimeout(() => {
        const result = this.simulateServerValidation(field, value, context);
        observer.next(result);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Validation de l'unicité d'un email
   */
  validateEmailUniqueness(email: string): Observable<ValidationResult> {
    if (!email) {
      return of({ valid: true, errors: [] });
    }

    // Simulation d'appel API
    return new Observable(observer => {
      setTimeout(() => {
        // Simuler quelques emails déjà utilisés
        const existingEmails = [
          'test@example.com',
          'admin@test.fr',
          'user@demo.com'
        ];

        const isUnique = !existingEmails.includes(email.toLowerCase());
        
        observer.next({
          valid: isUnique,
          errors: isUnique ? [] : ['Cette adresse email est déjà utilisée'],
          suggestions: isUnique ? [] : ['Essayez avec un autre email ou connectez-vous si c\'est votre compte']
        });
        observer.complete();
      }, 800);
    });
  }

  /**
   * Validation de numéro de téléphone avec vérification internationale
   */
  validatePhoneNumber(phone: string, countryCode: string): Observable<ValidationResult> {
    if (!phone || !countryCode) {
      return of({ valid: true, errors: [] });
    }

    return new Observable(observer => {
      setTimeout(() => {
        const result = this.validatePhoneFormat(phone, countryCode);
        observer.next(result);
        observer.complete();
      }, 300);
    });
  }

  /**
   * Validation de document avec OCR simulé
   */
  validateDocument(file: File, documentType: string): Observable<ValidationResult> {
    return new Observable(observer => {
      setTimeout(() => {
        const result = this.simulateDocumentValidation(file, documentType);
        observer.next(result);
        observer.complete();
      }, 2000); // Simulation d'un traitement plus long pour l'OCR
    });
  }

  /**
   * Validation de cohérence des données
   */
  validateDataConsistency(formData: any): Observable<ValidationResult> {
    return new Observable(observer => {
      setTimeout(() => {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Vérifier la cohérence âge/niveau d'études
        if (formData.personalInfo?.birthDate && formData.academicHistory?.educationLevel) {
          const age = this.calculateAge(formData.personalInfo.birthDate);
          const level = formData.academicHistory.educationLevel;

          if (level === 'BAC+5' && age < 22) {
            warnings.push('Âge inhabituel pour un niveau Bac+5');
          }
          if (level === 'BAC' && age > 25) {
            warnings.push('Âge inhabituel pour un niveau Baccalauréat');
          }
        }

        // Vérifier la cohérence dates académiques
        if (formData.academicHistory?.startDate && formData.academicHistory?.endDate) {
          const start = new Date(formData.academicHistory.startDate);
          const end = new Date(formData.academicHistory.endDate);
          const diffYears = (end.getTime() - start.getTime()) / (1000 * 3600 * 24 * 365);

          if (diffYears > 10) {
            warnings.push('Durée d\'études inhabituelle (plus de 10 ans)');
          }
        }

        // Vérifier la cohérence nationalité/établissement
        if (formData.personalInfo?.nationality && formData.academicHistory?.lastInstitution) {
          // Logique de vérification basée sur des patterns
          const institution = formData.academicHistory.lastInstitution.toLowerCase();
          const nationality = formData.personalInfo.nationality;

          if (nationality === 'FR' && !institution.includes('france') && !institution.includes('paris') && !institution.includes('lyon')) {
            // Pas forcément une erreur, juste une suggestion
          }
        }

        observer.next({
          valid: errors.length === 0,
          errors,
          warnings
        });
        observer.complete();
      }, 1000);
    });
  }

  /**
   * Validation de la force du mot de passe
   */
  validatePasswordStrength(password: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (!/[A-Z]/.test(password)) {
      warnings.push('Ajoutez au moins une majuscule');
    }

    if (!/[a-z]/.test(password)) {
      warnings.push('Ajoutez au moins une minuscule');
    }

    if (!/[0-9]/.test(password)) {
      warnings.push('Ajoutez au moins un chiffre');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      suggestions.push('Ajoutez des caractères spéciaux pour plus de sécurité');
    }

    // Vérifier les mots de passe communs
    const commonPasswords = ['password', '123456', 'azerty', 'motdepasse'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Mot de passe trop commun');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Simulation de validation côté serveur
   */
  private simulateServerValidation(field: string, value: any, context?: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (field) {
      case 'lastName':
        if (value && value.length < 2) {
          errors.push('Le nom doit contenir au moins 2 caractères');
        }
        if (value && !/^[a-zA-ZÀ-ÿ\s-']+$/.test(value)) {
          errors.push('Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes');
        }
        break;

      case 'birthDate':
        if (value) {
          const age = this.calculateAge(value);
          if (age < 16) {
            errors.push('Vous devez avoir au moins 16 ans');
          }
          if (age > 100) {
            warnings.push('Âge inhabituel, veuillez vérifier');
          }
        }
        break;

      case 'phone':
        if (value && context?.countryCode) {
          const phoneResult = this.validatePhoneFormat(value, context.countryCode);
          errors.push(...phoneResult.errors);
          warnings.push(...(phoneResult.warnings || []));
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validation du format de téléphone
   */
  private validatePhoneFormat(phone: string, countryCode: string): ValidationResult {
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    const errors: string[] = [];

    const patterns: { [key: string]: { pattern: RegExp; message: string } } = {
      '+33': { 
        pattern: /^[1-9][0-9]{8}$/, 
        message: 'Format français: 9 chiffres, ne commence pas par 0' 
      },
      '+213': { 
        pattern: /^[5-7][0-9]{8}$/, 
        message: 'Format algérien: 9 chiffres, commence par 5, 6 ou 7' 
      },
      '+212': { 
        pattern: /^[5-7][0-9]{8}$/, 
        message: 'Format marocain: 9 chiffres' 
      }
    };

    const validation = patterns[countryCode];
    if (validation && !validation.pattern.test(cleanPhone)) {
      errors.push(validation.message);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Simulation de validation de document
   */
  private simulateDocumentValidation(file: File, documentType: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Vérifications basiques
    if (file.size > 5 * 1024 * 1024) { // 5MB
      errors.push('Fichier trop volumineux (max 5MB)');
    }

    // Vérifications spécifiques par type
    switch (documentType) {
      case 'idCard':
        if (!file.type.startsWith('image/')) {
          errors.push('La carte d\'identité doit être une image');
        }
        // Simulation OCR
        if (Math.random() < 0.1) { // 10% de chance d'erreur OCR
          warnings.push('Qualité d\'image faible, OCR difficile');
        }
        break;

      case 'diploma':
        if (file.type !== 'application/pdf') {
          errors.push('Le diplôme doit être au format PDF');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calcul de l'âge
   */
  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Validation en temps réel avec debounce
   */
  validateFieldRealTime(field: string, value$: Observable<any>, context?: any): Observable<ValidationResult> {
    return value$.pipe(
      debounceTime(500),
      map(value => this.simulateServerValidation(field, value, context)),
      catchError(() => of({ valid: false, errors: ['Erreur de validation'] }))
    );
  }
}