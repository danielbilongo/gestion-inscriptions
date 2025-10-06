import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FileUploadResult {
  file: File;
  preview?: string;
  valid: boolean;
  errors: string[];
  ocrData?: any;
  securityScan?: {
    safe: boolean;
    threats: string[];
  };
  watermarkValidation?: {
    hasWatermark: boolean;
    confidence: number;
  };
}

export interface DocumentType {
  id: string;
  name: string;
  required: boolean;
  acceptedTypes: string[];
  maxSize: number; // en MB
  multiple: boolean;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  
  private readonly documentTypes: DocumentType[] = [
    {
      id: 'baccalaureate',
      name: 'Diplôme du Baccalauréat',
      required: true,
      acceptedTypes: ['application/pdf'],
      maxSize: 5,
      multiple: false,
      description: 'Diplôme du baccalauréat au format PDF (max 5Mo)'
    },
    {
      id: 'higherDiplomas',
      name: 'Diplômes Supérieurs',
      required: false,
      acceptedTypes: ['application/pdf'],
      maxSize: 5,
      multiple: true,
      description: 'Diplômes d\'études supérieures au format PDF (max 5Mo chacun)'
    },
    {
      id: 'idCardFront',
      name: 'CNI Recto',
      required: true,
      acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
      maxSize: 2,
      multiple: false,
      description: 'Recto de la carte d\'identité (JPG/PNG, max 2Mo)'
    },
    {
      id: 'idCardBack',
      name: 'CNI Verso',
      required: true,
      acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
      maxSize: 2,
      multiple: false,
      description: 'Verso de la carte d\'identité (JPG/PNG, max 2Mo)'
    },
    {
      id: 'birthCertificate',
      name: 'Acte de Naissance',
      required: true,
      acceptedTypes: ['application/pdf'],
      maxSize: 3,
      multiple: false,
      description: 'Acte de naissance au format PDF (max 3Mo)'
    },
    {
      id: 'identityPhoto',
      name: 'Photo d\'Identité',
      required: true,
      acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
      maxSize: 1,
      multiple: false,
      description: 'Photo d\'identité récente (JPG/PNG, max 1Mo, ratio 3.5x4.5cm)'
    }
  ];

  constructor() {}

  getDocumentTypes(): DocumentType[] {
    return this.documentTypes;
  }

  getDocumentType(id: string): DocumentType | undefined {
    return this.documentTypes.find(type => type.id === id);
  }

  validateFile(file: File, documentType: DocumentType): FileUploadResult {
    const errors: string[] = [];
    let valid = true;

    // Vérifier le type de fichier
    if (!documentType.acceptedTypes.includes(file.type)) {
      errors.push(`Type de fichier non accepté. Types acceptés: ${documentType.acceptedTypes.join(', ')}`);
      valid = false;
    }

    // Vérifier la taille
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > documentType.maxSize) {
      errors.push(`Fichier trop volumineux. Taille maximale: ${documentType.maxSize}Mo`);
      valid = false;
    }

    // Vérifier le nom du fichier
    if (file.name.length > 100) {
      errors.push('Nom de fichier trop long (max 100 caractères)');
      valid = false;
    }

    return {
      file,
      valid,
      errors
    };
  }

  async generatePreview(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        // Pour les PDF, on retourne une icône générique
        resolve('pdf-icon');
      } else {
        resolve(null);
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  validateImageDimensions(file: File, expectedRatio?: number): Promise<boolean> {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(true);
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (expectedRatio) {
          const actualRatio = img.width / img.height;
          const tolerance = 0.1; // 10% de tolérance
          resolve(Math.abs(actualRatio - expectedRatio) <= tolerance);
        } else {
          resolve(true);
        }
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  }

  detectDuplicateFiles(files: File[]): boolean {
    const fileHashes = new Set();
    
    for (const file of files) {
      const hash = `${file.name}-${file.size}-${file.lastModified}`;
      if (fileHashes.has(hash)) {
        return true;
      }
      fileHashes.add(hash);
    }
    
    return false;
  }

  scanForSuspiciousContent(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      // Vérifier les extensions dangereuses
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js', '.jar', '.com'];
      const fileName = file.name.toLowerCase();
      
      for (const ext of dangerousExtensions) {
        if (fileName.includes(ext)) {
          resolve(false);
          return;
        }
      }
      
      // Vérifier la taille (trop petit = suspect, trop gros = suspect)
      if (file.size < 100 || file.size > 50 * 1024 * 1024) { // 50MB max
        resolve(false);
        return;
      }
      
      // Vérifier les signatures de fichiers (magic numbers)
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer.slice(0, 8));
        
        // Signatures suspectes
        const suspiciousSignatures = [
          [0x4D, 0x5A], // PE executable
          [0x50, 0x4B, 0x03, 0x04], // ZIP (peut contenir des exécutables)
        ];
        
        for (const signature of suspiciousSignatures) {
          let match = true;
          for (let i = 0; i < signature.length; i++) {
            if (bytes[i] !== signature[i]) {
              match = false;
              break;
            }
          }
          if (match) {
            resolve(false);
            return;
          }
        }
        
        resolve(true);
      };
      
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 8));
    });
  }

  /**
   * Détection avancée de documents similaires/dupliqués
   */
  async detectSimilarDocuments(files: File[]): Promise<{ similar: boolean; pairs: string[] }> {
    const hashes: { [key: string]: string[] } = {};
    
    for (const file of files) {
      const hash = await this.generateFileHash(file);
      if (!hashes[hash]) {
        hashes[hash] = [];
      }
      hashes[hash].push(file.name);
    }
    
    const duplicatePairs: string[] = [];
    let hasSimilar = false;
    
    Object.values(hashes).forEach(fileNames => {
      if (fileNames.length > 1) {
        hasSimilar = true;
        duplicatePairs.push(`Documents similaires: ${fileNames.join(', ')}`);
      }
    });
    
    return { similar: hasSimilar, pairs: duplicatePairs };
  }

  /**
   * Génère un hash simple du fichier pour la détection de doublons
   */
  private async generateFileHash(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      };
      reader.onerror = () => resolve(`${file.name}-${file.size}-${file.lastModified}`);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Validation OCR basique pour les CNI (simulation)
   */
  async validateIdCardOCR(file: File): Promise<{ valid: boolean; extractedData?: any; errors: string[] }> {
    const errors: string[] = [];
    
    if (!file.type.startsWith('image/')) {
      errors.push('Le fichier doit être une image pour la validation OCR');
      return { valid: false, errors };
    }
    
    // Simulation de validation OCR
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Vérifier les dimensions minimales
        if (img.width < 300 || img.height < 200) {
          errors.push('Image trop petite pour une CNI valide');
          resolve({ valid: false, errors });
          return;
        }
        
        // Simulation d'extraction de données
        const extractedData = {
          hasText: true,
          hasPhoto: true,
          quality: 'good'
        };
        
        resolve({ valid: true, extractedData, errors });
      };
      
      img.onerror = () => {
        errors.push('Impossible de lire l\'image');
        resolve({ valid: false, errors });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Validation de filigrane pour les documents officiels
   */
  async validateWatermark(file: File): Promise<{ hasWatermark: boolean; confidence: number }> {
    // Simulation de détection de filigrane
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulation basée sur la taille et le type de fichier
        const confidence = Math.random() * 100;
        const hasWatermark = confidence > 30; // 70% de chance d'avoir un filigrane
        
        resolve({ hasWatermark, confidence });
      }, 500);
    });
  }
}
