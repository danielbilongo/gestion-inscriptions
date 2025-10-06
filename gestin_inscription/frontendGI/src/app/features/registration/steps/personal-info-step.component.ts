import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { RegistrationFormService, PersonalInfo } from '../../../core/services/registration-form.service';

@Component({
  selector: 'app-personal-info-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Informations Personnelles</h2>
        <p class="text-gray-600">Veuillez renseigner vos informations personnelles avec précision.</p>
      </div>

      <form [formGroup]="personalInfoForm" class="space-y-6">
        
        <!-- Nom de famille -->
        <div>
          <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
            Nom de famille <span class="text-red-500">*</span>
          </label>
          <input type="text" 
                 id="lastName"
                 formControlName="lastName"
                 class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                 placeholder="Votre nom de famille"
                 [class.border-red-300]="personalInfoForm.get('lastName')?.invalid && personalInfoForm.get('lastName')?.touched">
          <div *ngIf="personalInfoForm.get('lastName')?.invalid && personalInfoForm.get('lastName')?.touched" 
               class="mt-1 text-sm text-red-600">
            Le nom de famille est requis et ne doit contenir que des lettres.
          </div>
        </div>

        <!-- Prénoms -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Prénom(s) <span class="text-red-500">*</span>
          </label>
          <div formArrayName="firstNames" class="space-y-2">
            <div *ngFor="let firstName of firstNamesArray.controls; let i = index" 
                 class="flex items-center space-x-2">
              <input type="text" 
                     [formControlName]="i"
                     class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                     [placeholder]="i === 0 ? 'Premier prénom' : 'Prénom supplémentaire'"
                     [class.border-red-300]="firstName.invalid && firstName.touched">
              <button type="button" 
                      *ngIf="i > 0"
                      (click)="removeFirstName(i)"
                      class="p-2 text-red-600 hover:text-red-800">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
          <button type="button" 
                  (click)="addFirstName()"
                  class="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg class="mr-2 -ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
            </svg>
            Ajouter un prénom
          </button>
        </div>

        <!-- Genre -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Sexe <span class="text-red-500">*</span>
          </label>
          <div class="flex space-x-6">
            <div class="flex items-center">
              <input id="gender-m" 
                     type="radio" 
                     value="M" 
                     formControlName="gender"
                     class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300">
              <label for="gender-m" class="ml-2 block text-sm text-gray-900">Masculin</label>
            </div>
            <div class="flex items-center">
              <input id="gender-f" 
                     type="radio" 
                     value="F" 
                     formControlName="gender"
                     class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300">
              <label for="gender-f" class="ml-2 block text-sm text-gray-900">Féminin</label>
            </div>
            <div class="flex items-center">
              <input id="gender-nb" 
                     type="radio" 
                     value="NON_BINARY" 
                     formControlName="gender"
                     class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300">
              <label for="gender-nb" class="ml-2 block text-sm text-gray-900">Non-binaire</label>
            </div>
          </div>
          <div *ngIf="personalInfoForm.get('gender')?.invalid && personalInfoForm.get('gender')?.touched" 
               class="mt-1 text-sm text-red-600">
            Veuillez sélectionner votre sexe.
          </div>
        </div>

        <!-- Date de naissance -->
        <div>
          <label for="birthDate" class="block text-sm font-medium text-gray-700 mb-2">
            Date de naissance <span class="text-red-500">*</span>
          </label>
          <input type="date" 
                 id="birthDate"
                 formControlName="birthDate"
                 [max]="maxBirthDate"
                 class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                 [class.border-red-300]="personalInfoForm.get('birthDate')?.invalid && personalInfoForm.get('birthDate')?.touched">
          <div *ngIf="personalInfoForm.get('birthDate')?.invalid && personalInfoForm.get('birthDate')?.touched" 
               class="mt-1 text-sm text-red-600">
            <span *ngIf="personalInfoForm.get('birthDate')?.errors?.['required']">
              La date de naissance est requise.
            </span>
            <span *ngIf="personalInfoForm.get('birthDate')?.errors?.['ageValidator']">
              Vous devez avoir au moins 16 ans pour vous inscrire.
            </span>
          </div>
        </div>

        <!-- Nationalité -->
        <div>
          <label for="nationality" class="block text-sm font-medium text-gray-700 mb-2">
            Nationalité <span class="text-red-500">*</span>
          </label>
          <select id="nationality"
                  formControlName="nationality"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  [class.border-red-300]="personalInfoForm.get('nationality')?.invalid && personalInfoForm.get('nationality')?.touched">
            <option value="">Sélectionnez votre nationalité</option>
            <option *ngFor="let country of countries" [value]="country.code">{{country.name}}</option>
          </select>
          <div *ngIf="personalInfoForm.get('nationality')?.invalid && personalInfoForm.get('nationality')?.touched" 
               class="mt-1 text-sm text-red-600">
            Veuillez sélectionner votre nationalité.
          </div>
        </div>

        <!-- Type de pièce d'identité -->
        <div>
          <label for="idType" class="block text-sm font-medium text-gray-700 mb-2">
            Type de pièce d'identité <span class="text-red-500">*</span>
          </label>
          <select id="idType"
                  formControlName="idType"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  [class.border-red-300]="personalInfoForm.get('idType')?.invalid && personalInfoForm.get('idType')?.touched">
            <option value="">Sélectionnez le type de pièce</option>
            <option value="CNI">Carte Nationale d'Identité</option>
            <option value="PASSPORT">Passeport</option>
            <option value="BIRTH_CERTIFICATE">Acte de naissance</option>
          </select>
          <div *ngIf="personalInfoForm.get('idType')?.invalid && personalInfoForm.get('idType')?.touched" 
               class="mt-1 text-sm text-red-600">
            Veuillez sélectionner le type de pièce d'identité.
          </div>
        </div>

      </form>
    </div>
  `
})
export class PersonalInfoStepComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  personalInfoForm!: FormGroup;
  maxBirthDate: string;

  countries = [
    { code: 'FR', name: 'France' },
    { code: 'DZ', name: 'Algérie' },
    { code: 'MA', name: 'Maroc' },
    { code: 'TN', name: 'Tunisie' },
    { code: 'SN', name: 'Sénégal' },
    { code: 'CI', name: 'Côte d\'Ivoire' },
    { code: 'CM', name: 'Cameroun' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'ML', name: 'Mali' },
    { code: 'NE', name: 'Niger' },
    // Ajouter plus de pays selon les besoins
  ];

  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationFormService
  ) {
    // Date maximale = aujourd'hui - 16 ans
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 16);
    this.maxBirthDate = maxDate.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadSavedData();
    this.setupFormValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get firstNamesArray(): FormArray {
    return this.personalInfoForm.get('firstNames') as FormArray;
  }

  private initializeForm(): void {
    this.personalInfoForm = this.fb.group({
      lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s-']+$/)]],
      firstNames: this.fb.array([
        this.fb.control('', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s-']+$/)])
      ]),
      gender: ['', Validators.required],
      birthDate: ['', [Validators.required, this.ageValidator]],
      nationality: ['', Validators.required],
      idType: ['', Validators.required]
    });
  }

  private loadSavedData(): void {
    const formData = this.registrationService.getFormData();
    if (formData.personalInfo) {
      const { firstNames, ...otherData } = formData.personalInfo;
      
      // Charger les autres données
      this.personalInfoForm.patchValue(otherData);
      
      // Charger les prénoms
      this.firstNamesArray.clear();
      firstNames.forEach(name => {
        this.firstNamesArray.push(this.fb.control(name, [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s-']+$/)]));
      });
    }
  }

  private setupFormValidation(): void {
    this.personalInfoForm.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        // Sauvegarder automatiquement
        this.registrationService.updateFormData('personalInfo', value);
        
        // Marquer l'étape comme valide/invalide
        this.registrationService.markStepValid(1, this.personalInfoForm.valid);
      });
  }

  addFirstName(): void {
    this.firstNamesArray.push(
      this.fb.control('', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s-']+$/)])
    );
  }

  removeFirstName(index: number): void {
    if (this.firstNamesArray.length > 1) {
      this.firstNamesArray.removeAt(index);
    }
  }

  private ageValidator(control: any) {
    if (!control.value) return null;
    
    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 16 ? null : { ageValidator: true };
    }
    
    return age >= 16 ? null : { ageValidator: true };
  }
}
