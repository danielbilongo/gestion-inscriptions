import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Interface pour les résultats OCR
export interface OCRResult {
  text: string;
  confidence: number;
  extractedData?: {
    name?: string;
    birthDate?: string;
    idNumber?: string;
    nationality?: string;
  };
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class OCRService {
  private tesseractWorker: any;

  constructor() {
    this.initializeTesseract();
  }

  private async initializeTesseract(): Promise<void> {
    try {
      // Simulation OCR - Tesseract.js n'est pas installé
      console.log('OCR Service initialized (simulation mode)');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Tesseract:', error);
    }
  }

  /**
   * Extraction de texte depuis une image
   */
  extractText(file: File): Observable<OCRResult> {
    return new Observable(observer => {
      // Simulation OCR
      setTimeout(() => {
        const mockResult: OCRResult = {
          text: 'RÉPUBLIQUE FRANÇAISE\nCARTE NATIONALE D\'IDENTITÉ\nDUPONT\nJean\n01/01/1990\nAB123456C\nFRANÇAISE',
          confidence: 85,
          extractedData: {
            name: 'DUPONT Jean',
            birthDate: '01/01/1990',
            idNumber: 'AB123456C',
            nationality: 'FRANÇAISE'
          },
          errors: []
        };
        observer.next(mockResult);
        observer.complete();
      }, 1000);
    });
  }

  /**
   * Validation spécifique pour carte d'identité
   */
  validateIdCard(file: File): Observable<OCRResult> {
    return new Observable(observer => {
      this.extractText(file).subscribe(result => {
        const validation = this.validateIdCardContent(result.text);
        observer.next({
          ...result,
          errors: [...result.errors, ...validation.errors],
          extractedData: validation.extractedData
        });
        observer.complete();
      });
    });
  }

  /**
   * Parsing des données de carte d'identité
   */
  private parseIdCardData(text: string): any {
    const data: any = {};
    const lines = text.split('\n').map(line => line.trim());

    // Patterns de reconnaissance
    const patterns = {
      name: /^([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ\s-']+)$/,
      birthDate: /(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/,
      idNumber: /([A-Z0-9]{8,15})/,
      nationality: /(FRANÇAISE?|FRANÇAIS|ALGÉRIENNE?|MAROCAINE?|TUNISIENNE?)/i
    };

    lines.forEach(line => {
      // Recherche de nom (généralement en majuscules)
      if (patterns.name.test(line) && line.length > 3 && line.length < 50) {
        if (!data.name || line.length > data.name.length) {
          data.name = line;
        }
      }

      // Recherche de date de naissance
      const birthMatch = line.match(patterns.birthDate);
      if (birthMatch) {
        data.birthDate = birthMatch[1];
      }

      // Recherche de numéro d'identité
      const idMatch = line.match(patterns.idNumber);
      if (idMatch && !data.idNumber) {
        data.idNumber = idMatch[1];
      }

      // Recherche de nationalité
      const nationalityMatch = line.match(patterns.nationality);
      if (nationalityMatch) {
        data.nationality = nationalityMatch[1];
      }
    });

    return data;
  }

  /**
   * Validation du contenu de carte d'identité
   */
  private validateIdCardContent(text: string): { extractedData: any; errors: string[] } {
    const errors: string[] = [];
    const extractedData = this.parseIdCardData(text);

    // Vérifications de base
    if (!text || text.length < 50) {
      errors.push('Texte extrait trop court, qualité d\'image insuffisante');
    }

    if (!extractedData.name) {
      errors.push('Nom non détecté sur la carte d\'identité');
    }

    if (!extractedData.birthDate) {
      errors.push('Date de naissance non détectée');
    } else {
      // Validation du format de date
      const dateRegex = /^\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4}$/;
      if (!dateRegex.test(extractedData.birthDate)) {
        errors.push('Format de date de naissance invalide');
      }
    }

    if (!extractedData.idNumber) {
      errors.push('Numéro d\'identité non détecté');
    }

    // Vérification de mots-clés obligatoires
    const requiredKeywords = ['RÉPUBLIQUE', 'CARTE', 'IDENTITÉ'];
    const hasRequiredKeywords = requiredKeywords.some(keyword => 
      text.toUpperCase().includes(keyword)
    );

    if (!hasRequiredKeywords) {
      errors.push('Document ne semble pas être une carte d\'identité valide');
    }

    return { extractedData, errors };
  }

  /**
   * Nettoyage des ressources
   */
  async cleanup(): Promise<void> {
    // Simulation - pas de ressources à nettoyer
    console.log('OCR cleanup completed');
  }
}