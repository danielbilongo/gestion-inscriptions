import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { RegistrationFormService, AcademicHistory } from '../../../core/services/registration-form.service';
import { GeolocationService, Institution } from '../../../core/services/geolocation.service';

@Component({
  selector: 'app-academic-history-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Parcours Académique</h2>
        <p class="text-gray-600">Renseignez votre parcours académique et vos qualifications.</p>
      </div>

      <form [formGroup]="academicForm" class="space-y-6">
        
        <!-- Dernier établissement -->
        <div>
          <label for="lastInstitution" class="block text-sm font-medium text-gray-700 mb-2">
            Dernier établissement fréquenté <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input type="text" 
                   id="lastInstitution"
                   formControlName="lastInstitution"
                   (input)="onInstitutionInput($event)"
                   (focus)="showInstitutionSuggestions = true"
                   (blur)="hideInstitutionSuggestions()"
                   class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                   placeholder="Nom de l'établissement"
                   [class.border-red-300]="academicForm.get('lastInstitution')?.invalid && academicForm.get('lastInstitution')?.touched">
            
            <!-- Suggestions d'établissements -->
            <div *ngIf="showInstitutionSuggestions && institutionSuggestions.length > 0" 
                 class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              <div *ngFor="let institution of institutionSuggestions" 
                   (mousedown)="selectInstitution(institution)"
                   class="px-3 py-2 cursor-pointer hover:bg-gray-100">
                <div class="font-medium text-gray-900">{{institution.name}}</div>
                <div class="text-sm text-gray-500">{{institution.city}}, {{institution.country}}</div>
              </div>
            </div>
          </div>
          <div *ngIf="academicForm.get('lastInstitution')?.invalid && academicForm.get('lastInstitution')?.touched" 
               class="mt-1 text-sm text-red-600">
            Le nom de l'établissement est requis.
          </div>
        </div>

        <!-- Niveau d'études -->
        <div>
          <label for="educationLevel" class="block text-sm font-medium text-gray-700 mb-2">
            Niveau d'études <span class="text-red-500">*</span>
          </label>
          <select id="educationLevel"
                  formControlName="educationLevel"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  [class.border-red-300]="academicForm.get('educationLevel')?.invalid && academicForm.get('educationLevel')?.touched">
            <option value="">Sélectionnez votre niveau</option>
            <option value="BAC">Baccalauréat</option>
            <option value="BAC+1">Bac+1</option>
            <option value="BAC+2">Bac+2 (BTS/DUT)</option>
            <option value="BAC+3">Bac+3 (Licence)</option>
            <option value="BAC+4">Bac+4 (Maîtrise)</option>
            <option value="BAC+5">Bac+5 (Master)</option>
            <option value="BAC+8">Bac+8 (Doctorat)</option>
          </select>
          <div *ngIf="academicForm.get('educationLevel')?.invalid && academicForm.get('educationLevel')?.touched" 
               class="mt-1 text-sm text-red-600">
            Veuillez sélectionner votre niveau d'études.
          </div>
        </div>

        <!-- Spécialisation -->
        <div>
          <label for="specialization" class="block text-sm font-medium text-gray-700 mb-2">
            Spécialisation <span class="text-red-500">*</span>
          </label>
          <select id="specialization"
                  formControlName="specialization"
                  (change)="onSpecializationChange()"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  [class.border-red-300]="academicForm.get('specialization')?.invalid && academicForm.get('specialization')?.touched">
            <option value="">Sélectionnez une spécialisation</option>
            <option *ngFor="let spec of specializations" [value]="spec.code">{{spec.name}}</option>
          </select>
          <div *ngIf="academicForm.get('specialization')?.invalid && academicForm.get('specialization')?.touched" 
               class="mt-1 text-sm text-red-600">
            Veuillez sélectionner votre spécialisation.
          </div>
        </div>

        <!-- Sous-spécialisation -->
        <div *ngIf="subSpecializations.length > 0">
          <label for="subSpecialization" class="block text-sm font-medium text-gray-700 mb-2">
            Sous-spécialisation
          </label>
          <select id="subSpecialization"
                  formControlName="subSpecialization"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">Sélectionnez une sous-spécialisation</option>
            <option *ngFor="let subSpec of subSpecializations" [value]="subSpec.code">{{subSpec.name}}</option>
          </select>
        </div>

        <!-- Période de formation -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700 mb-2">
              Date de début <span class="text-red-500">*</span>
            </label>
            <input type="date" 
                   id="startDate"
                   formControlName="startDate"
                   class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                   [class.border-red-300]="academicForm.get('startDate')?.invalid && academicForm.get('startDate')?.touched">
            <div *ngIf="academicForm.get('startDate')?.invalid && academicForm.get('startDate')?.touched" 
                 class="mt-1 text-sm text-red-600">
              La date de début est requise.
            </div>
          </div>
          
          <div>
            <label for="endDate" class="block text-sm font-medium text-gray-700 mb-2">
              Date de fin <span class="text-red-500">*</span>
            </label>
            <input type="date" 
                   id="endDate"
                   formControlName="endDate"
                   class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                   [class.border-red-300]="academicForm.get('endDate')?.invalid && academicForm.get('endDate')?.touched">
            <div *ngIf="academicForm.get('endDate')?.invalid && academicForm.get('endDate')?.touched" 
                 class="mt-1 text-sm text-red-600">
              <span *ngIf="academicForm.get('endDate')?.errors?.['required']">La date de fin est requise.</span>
              <span *ngIf="academicForm.get('endDate')?.errors?.['dateRange']">La date de fin doit être postérieure à la date de début.</span>
            </div>
          </div>
        </div>

        <!-- GPA/Moyenne -->
        <div>
          <label for="gpa" class="block text-sm font-medium text-gray-700 mb-2">
            Moyenne générale (optionnel)
          </label>
          <input type="number" 
                 id="gpa"
                 formControlName="gpa"
                 min="0"
                 max="20"
                 step="0.01"
                 class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                 placeholder="Ex: 15.5">
        </div>

        <!-- Mentions/Distinctions -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Mentions ou distinctions (optionnel)
          </label>
          <div formArrayName="honors" class="space-y-2">
            <div *ngFor="let honor of honorsArray.controls; let i = index" 
                 class="flex items-center space-x-2">
              <input type="text" 
                     [formControlName]="i"
                     class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                     placeholder="Ex: Mention Très Bien">
              <button type="button" 
                      (click)="removeHonor(i)"
                      class="p-2 text-red-600 hover:text-red-800">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
          <button type="button" 
                  (click)="addHonor()"
                  class="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <svg class="mr-2 -ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
            </svg>
            Ajouter une mention
          </button>
        </div>

      </form>
    </div>
  `
})
export class AcademicHistoryStepComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  academicForm!: FormGroup;

  specializations = [
    { code: 'INFORMATIQUE', name: 'Informatique' },
    { code: 'MATHEMATIQUES', name: 'Mathématiques' },
    { code: 'PHYSIQUE', name: 'Physique' },
    { code: 'CHIMIE', name: 'Chimie' },
    { code: 'BIOLOGIE', name: 'Biologie' },
    { code: 'ECONOMIE', name: 'Économie' },
    { code: 'GESTION', name: 'Gestion' },
    { code: 'DROIT', name: 'Droit' },
    { code: 'LETTRES', name: 'Lettres' },
    { code: 'LANGUES', name: 'Langues' }
  ];

  subSpecializations: any[] = [];

  private subSpecializationMap: { [key: string]: any[] } = {
    'INFORMATIQUE': [
      { code: 'DEV_WEB', name: 'Développement Web' },
      { code: 'IA', name: 'Intelligence Artificielle' },
      { code: 'CYBERSEC', name: 'Cybersécurité' },
      { code: 'DATA_SCIENCE', name: 'Data Science' }
    ],
    'ECONOMIE': [
      { code: 'MACRO', name: 'Macroéconomie' },
      { code: 'MICRO', name: 'Microéconomie' },
      { code: 'FINANCE', name: 'Finance' }
    ],
    'GESTION': [
      { code: 'RH', name: 'Ressources Humaines' },
      { code: 'MARKETING', name: 'Marketing' },
      { code: 'COMPTABILITE', name: 'Comptabilité' }
    ]
  };

  institutionSuggestions: Institution[] = [];
  showInstitutionSuggestions = false;

  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationFormService,
    private geolocationService: GeolocationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadSavedData();
    this.setupFormValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get honorsArray(): FormArray {
    return this.academicForm.get('honors') as FormArray;
  }

  private initializeForm(): void {
    this.academicForm = this.fb.group({
      lastInstitution: ['', Validators.required],
      educationLevel: ['', Validators.required],
      specialization: ['', Validators.required],
      subSpecialization: [''],
      startDate: ['', Validators.required],
      endDate: ['', [Validators.required, this.dateRangeValidator.bind(this)]],
      gpa: [null, [Validators.min(0), Validators.max(20)]],
      honors: this.fb.array([])
    });
  }

  private loadSavedData(): void {
    const formData = this.registrationService.getFormData();
    if (formData.academicHistory) {
      const { honors, ...otherData } = formData.academicHistory;
      
      this.academicForm.patchValue(otherData);
      
      // Charger les mentions
      this.honorsArray.clear();
      if (honors && honors.length > 0) {
        honors.forEach(honor => {
          this.honorsArray.push(this.fb.control(honor));
        });
      }

      // Mettre à jour les sous-spécialisations
      if (otherData.specialization) {
        this.updateSubSpecializations(otherData.specialization);
      }
    }
  }

  private setupFormValidation(): void {
    this.academicForm.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.registrationService.updateFormData('academicHistory', value);
        this.registrationService.markStepValid(3, this.academicForm.valid);
      });
  }

  onSpecializationChange(): void {
    const specialization = this.academicForm.get('specialization')?.value;
    this.updateSubSpecializations(specialization);
    this.academicForm.get('subSpecialization')?.setValue('');
  }

  private updateSubSpecializations(specialization: string): void {
    this.subSpecializations = this.subSpecializationMap[specialization] || [];
  }

  addHonor(): void {
    this.honorsArray.push(this.fb.control(''));
  }

  removeHonor(index: number): void {
    this.honorsArray.removeAt(index);
  }

  private dateRangeValidator(control: any) {
    if (!control.value) return null;
    
    const startDate = this.academicForm?.get('startDate')?.value;
    if (!startDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(control.value);
    
    return end > start ? null : { dateRange: true };
  }

  onInstitutionInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;
    
    if (query.length >= 2) {
      this.geolocationService.searchInstitutions(query)
        .pipe(takeUntil(this.destroy$))
        .subscribe(institutions => {
          this.institutionSuggestions = institutions;
          this.showInstitutionSuggestions = true;
        });
    } else {
      this.institutionSuggestions = [];
      this.showInstitutionSuggestions = false;
    }
  }

  selectInstitution(institution: Institution): void {
    this.academicForm.patchValue({
      lastInstitution: institution.name
    });
    
    this.institutionSuggestions = [];
    this.showInstitutionSuggestions = false;
  }

  hideInstitutionSuggestions(): void {
    setTimeout(() => {
      this.showInstitutionSuggestions = false;
    }, 200);
  }
}