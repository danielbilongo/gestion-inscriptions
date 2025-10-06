import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { RegistrationFormService, Documents } from '../../../core/services/registration-form.service';
import { FileUploadService, DocumentType, FileUploadResult } from '../../../core/services/file-upload.service';
import { OCRService, OCRResult } from '../../../core/services/ocr.service';

@Component({
  selector: 'app-documents-step',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Documents Officiels</h2>
        <p class="text-gray-600">Téléchargez vos documents officiels selon les spécifications requises.</p>
      </div>

      <!-- Progress indicator -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <span class="text-sm text-blue-800">
            {{getUploadedCount()}} / {{getTotalRequiredCount()}} documents requis téléchargés
          </span>
        </div>
        <div class="mt-2 w-full bg-blue-200 rounded-full h-2">
          <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
               [style.width.%]="getProgressPercentage()"></div>
        </div>
      </div>

      <!-- Document upload sections -->
      <div class="space-y-8">
        <div *ngFor="let docType of documentTypes" class="border border-gray-200 rounded-lg p-6">
          
          <!-- Document header -->
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-medium text-gray-900 flex items-center">
                {{docType.name}}
                <span *ngIf="docType.required" class="ml-2 text-red-500 text-sm">*</span>
                <span *ngIf="uploadedFiles[docType.id]" class="ml-2">
                  <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </span>
              </h3>
              <p class="text-sm text-gray-500">{{docType.description}}</p>
            </div>
          </div>

          <!-- Upload area -->
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
               [class.border-green-300]="uploadedFiles[docType.id]"
               [class.bg-green-50]="uploadedFiles[docType.id]">
            
            <!-- File input -->
            <input type="file" 
                   [id]="'file-' + docType.id"
                   [accept]="docType.acceptedTypes.join(',')"
                   [multiple]="docType.multiple"
                   (change)="onFileSelected($event, docType)"
                   class="hidden">
            
            <!-- Upload button/preview -->
            <div *ngIf="!uploadedFiles[docType.id]">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div class="mt-4">
                <label [for]="'file-' + docType.id" 
                       class="cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <span class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                    Sélectionner {{docType.multiple ? 'des fichiers' : 'un fichier'}}
                  </span>
                </label>
                <p class="mt-2 text-xs text-gray-500">
                  {{docType.acceptedTypes.join(', ')}} jusqu'à {{docType.maxSize}}Mo
                </p>
              </div>
            </div>

            <!-- File preview -->
            <div *ngIf="uploadedFiles[docType.id]" class="space-y-4">
              <div *ngFor="let fileResult of getFileResults(docType.id); let i = index" 
                   class="flex items-center justify-between bg-white p-3 rounded border">
                
                <!-- File info -->
                <div class="flex items-center space-x-3">
                  <!-- Preview thumbnail -->
                  <div class="flex-shrink-0">
                    <img *ngIf="fileResult.preview && fileResult.preview !== 'pdf-icon'" 
                         [src]="fileResult.preview" 
                         class="h-10 w-10 object-cover rounded border">
                    <div *ngIf="fileResult.preview === 'pdf-icon'" 
                         class="h-10 w-10 bg-red-100 rounded border flex items-center justify-center">
                      <svg class="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <div *ngIf="!fileResult.preview" 
                         class="h-10 w-10 bg-gray-100 rounded border flex items-center justify-center">
                      <svg class="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  
                  <!-- File details -->
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900 truncate">{{fileResult.file.name}}</p>
                    <p class="text-sm text-gray-500">{{formatFileSize(fileResult.file.size)}}</p>
                    
                    <!-- Validation errors -->
                    <div *ngIf="!fileResult.valid" class="mt-1">
                      <p *ngFor="let error of fileResult.errors" class="text-xs text-red-600">{{error}}</p>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center space-x-2">
                  <!-- Status indicator -->
                  <div *ngIf="fileResult.valid" class="text-green-500">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div *ngIf="!fileResult.valid" class="text-red-500">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  
                  <!-- Remove button -->
                  <button type="button" 
                          (click)="removeFile(docType.id, i)"
                          class="text-red-600 hover:text-red-800 p-1">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Add more files button for multiple uploads -->
              <div *ngIf="docType.multiple" class="text-center">
                <label [for]="'file-' + docType.id" 
                       class="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <svg class="mr-2 -ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                  </svg>
                  Ajouter un autre fichier
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Validation summary -->
      <div *ngIf="hasValidationErrors()" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div>
            <h3 class="text-sm font-medium text-red-800">Erreurs de validation</h3>
            <p class="mt-1 text-sm text-red-700">Veuillez corriger les erreurs ci-dessus avant de continuer.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DocumentsStepComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  documentTypes: DocumentType[] = [];
  uploadedFiles: { [key: string]: FileUploadResult[] } = {};

  constructor(
    private registrationService: RegistrationFormService,
    private fileUploadService: FileUploadService,
    private ocrService: OCRService
  ) {}

  ngOnInit(): void {
    this.documentTypes = this.fileUploadService.getDocumentTypes();
    
    // Attendre un peu pour que les données soient chargées
    setTimeout(() => {
      this.loadSavedFiles();
      this.setupValidation();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onFileSelected(event: Event, docType: DocumentType): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    
    // Vérifier les doublons
    if (this.fileUploadService.detectDuplicateFiles(files)) {
      alert('Des fichiers en double ont été détectés.');
      return;
    }

    for (const file of files) {
      // Validation du fichier
      const result = this.fileUploadService.validateFile(file, docType);
      
      // Scan de sécurité
      const isSafe = await this.fileUploadService.scanForSuspiciousContent(file);
      if (!isSafe) {
        result.valid = false;
        result.errors.push('Fichier suspect détecté');
      }

      // Validation des dimensions pour les photos d'identité
      if (docType.id === 'identityPhoto' && file.type.startsWith('image/')) {
        const validDimensions = await this.fileUploadService.validateImageDimensions(file, 3.5/4.5);
        if (!validDimensions) {
          result.errors.push('Ratio d\'image incorrect. Utilisez un ratio 3.5x4.5cm');
          result.valid = false;
        }
      }

      // OCR pour les cartes d'identité
      if ((docType.id === 'idCardFront' || docType.id === 'idCardBack') && file.type.startsWith('image/')) {
        try {
          const ocrResult = await this.ocrService.validateIdCard(file).toPromise();
          if (ocrResult) {
            result.ocrData = ocrResult.extractedData;
            if (ocrResult.errors.length > 0) {
              result.errors.push(...ocrResult.errors);
            }
            if (ocrResult.confidence < 70) {
              result.errors.push('Qualité d\'image insuffisante pour la reconnaissance automatique');
            }
          }
        } catch (error) {
          console.warn('Erreur OCR:', error);
          result.errors.push('Impossible de traiter l\'image automatiquement');
        }
      }

      // Générer la preview
      result.preview = await this.fileUploadService.generatePreview(file) || undefined;

      // Ajouter le fichier
      if (!this.uploadedFiles[docType.id]) {
        this.uploadedFiles[docType.id] = [];
      }

      if (docType.multiple) {
        this.uploadedFiles[docType.id].push(result);
      } else {
        this.uploadedFiles[docType.id] = [result];
      }
    }

    // Réinitialiser l'input
    input.value = '';
    
    // Sauvegarder
    this.saveFiles();
  }

  removeFile(docTypeId: string, index: number): void {
    if (this.uploadedFiles[docTypeId]) {
      this.uploadedFiles[docTypeId].splice(index, 1);
      if (this.uploadedFiles[docTypeId].length === 0) {
        delete this.uploadedFiles[docTypeId];
      }
      this.saveFiles();
    }
  }

  getFileResults(docTypeId: string): FileUploadResult[] {
    return this.uploadedFiles[docTypeId] || [];
  }

  formatFileSize(bytes: number): string {
    return this.fileUploadService.formatFileSize(bytes);
  }

  getUploadedCount(): number {
    return this.documentTypes
      .filter(dt => dt.required && this.uploadedFiles[dt.id]?.some(f => f.valid))
      .length;
  }

  getTotalRequiredCount(): number {
    return this.documentTypes.filter(dt => dt.required).length;
  }

  getProgressPercentage(): number {
    const total = this.getTotalRequiredCount();
    if (total === 0) return 100;
    return Math.round((this.getUploadedCount() / total) * 100);
  }

  hasValidationErrors(): boolean {
    return Object.values(this.uploadedFiles)
      .flat()
      .some(file => !file.valid);
  }

  private loadSavedFiles(): void {
    // Charger les fichiers sauvegardés depuis le service
    const formData = this.registrationService.getFormData();
    if (formData.documents) {
      // Reconstruire les FileUploadResult depuis les fichiers sauvegardés
      Object.keys(formData.documents).forEach(key => {
        const files = formData.documents[key as keyof Documents];
        if (files) {
          if (Array.isArray(files)) {
            // Pour les fichiers multiples (higherDiplomas)
            this.uploadedFiles[key] = files.map(file => ({
              file: file,
              valid: true,
              errors: [],
              preview: this.generatePreviewFromFile(file)
            }));
          } else if (files instanceof File) {
            // Pour les fichiers uniques
            this.uploadedFiles[key] = [{
              file: files,
              valid: true,
              errors: [],
              preview: this.generatePreviewFromFile(files)
            }];
          }
        }
      });
    }
    
    console.log('Fichiers chargés depuis le stockage:', this.uploadedFiles);
  }

  private saveFiles(): void {
    // Convertir les fichiers en format sérialisable pour le service
    const documentsData: any = {};
    
    Object.keys(this.uploadedFiles).forEach(key => {
      const validFiles = this.uploadedFiles[key].filter(f => f.valid);
      if (validFiles.length > 0) {
        if (key === 'higherDiplomas') {
          documentsData[key] = validFiles.map(f => f.file);
        } else {
          documentsData[key] = validFiles[0]?.file;
        }
      }
    });

    console.log('Sauvegarde des fichiers:', documentsData);
    this.registrationService.updateFormData('documents', documentsData);
    
    // Forcer une sauvegarde immédiate
    this.registrationService.forceSave();
  }

  private setupValidation(): void {
    // Valider l'étape en temps réel
    const validateStep = () => {
      const requiredDocsValid = this.documentTypes
        .filter(dt => dt.required)
        .every(dt => this.uploadedFiles[dt.id]?.some(f => f.valid));
      
      const noValidationErrors = !this.hasValidationErrors();
      
      this.registrationService.markStepValid(2, requiredDocsValid && noValidationErrors);
    };

    // Valider initialement et à chaque changement
    validateStep();
    
    // Observer les changements (simulé avec un timer pour cette démo)
    setInterval(() => validateStep(), 1000);
  }

  private generatePreviewFromFile(file: File): string | undefined {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    } else if (file.type === 'application/pdf') {
      return 'pdf-icon';
    }
    return undefined;
  }

  /**
   * Restaurer les fichiers lors du retour sur cette étape
   */
  restoreFiles(): void {
    console.log('Restauration des fichiers...');
    this.loadSavedFiles();
  }

  /**
   * Vérifier si des fichiers sont présents
   */
  hasFiles(): boolean {
    return Object.keys(this.uploadedFiles).length > 0;
  }
}
