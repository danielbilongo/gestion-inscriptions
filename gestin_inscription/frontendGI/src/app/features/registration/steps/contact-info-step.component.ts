import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { RegistrationFormService, ContactInfo } from '../../../core/services/registration-form.service';
import { GeolocationService, AddressSuggestion } from '../../../core/services/geolocation.service';

@Component({
  selector: 'app-contact-info-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Coordonnées</h2>
        <p class="text-gray-600">Renseignez vos coordonnées de contact et votre adresse.</p>
      </div>

      <form [formGroup]="contactForm" class="space-y-6">
        
        <!-- Email -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Adresse email <span class="text-red-500">*</span>
            </label>
            <input type="email" 
                   id="email"
                   formControlName="email"
                   class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                   placeholder="votre@email.com"
                   [class.border-red-300]="contactForm.get('email')?.invalid && contactForm.get('email')?.touched">
            <div *ngIf="contactForm.get('email')?.invalid && contactForm.get('email')?.touched" 
                 class="mt-1 text-sm text-red-600">
              <span *ngIf="contactForm.get('email')?.errors?.['required']">L'email est requis.</span>
              <span *ngIf="contactForm.get('email')?.errors?.['email']">Format d'email invalide.</span>
            </div>
          </div>
          
          <div>
            <label for="emailConfirm" class="block text-sm font-medium text-gray-700 mb-2">
              Confirmer l'email <span class="text-red-500">*</span>
            </label>
            <input type="email" 
                   id="emailConfirm"
                   formControlName="emailConfirm"
                   class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                   placeholder="Confirmez votre email"
                   [class.border-red-300]="contactForm.get('emailConfirm')?.invalid && contactForm.get('emailConfirm')?.touched">
            <div *ngIf="contactForm.get('emailConfirm')?.invalid && contactForm.get('emailConfirm')?.touched" 
                 class="mt-1 text-sm text-red-600">
              <span *ngIf="contactForm.get('emailConfirm')?.errors?.['required']">La confirmation d'email est requise.</span>
              <span *ngIf="contactForm.get('emailConfirm')?.errors?.['emailMismatch']">Les emails ne correspondent pas.</span>
            </div>
          </div>
        </div>

        <!-- Téléphone -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="countryCode" class="block text-sm font-medium text-gray-700 mb-2">
              Indicatif <span class="text-red-500">*</span>
            </label>
            <select id="countryCode"
                    formControlName="countryCode"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    [class.border-red-300]="contactForm.get('countryCode')?.invalid && contactForm.get('countryCode')?.touched">
              <option value="">Code</option>
              <option *ngFor="let country of countryCodes" [value]="country.code">
                {{country.flag}} {{country.code}} ({{country.name}})
              </option>
            </select>
          </div>
          
          <div class="md:col-span-2">
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone <span class="text-red-500">*</span>
            </label>
            <input type="tel" 
                   id="phone"
                   formControlName="phone"
                   class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                   placeholder="123456789"
                   [class.border-red-300]="contactForm.get('phone')?.invalid && contactForm.get('phone')?.touched">
            <div *ngIf="contactForm.get('phone')?.invalid && contactForm.get('phone')?.touched" 
                 class="mt-1 text-sm text-red-600">
              <span *ngIf="contactForm.get('phone')?.errors?.['required']">Le numéro de téléphone est requis.</span>
              <span *ngIf="contactForm.get('phone')?.errors?.['pattern']">Format de téléphone invalide.</span>
            </div>
          </div>
        </div>

        <!-- Adresse -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Adresse de résidence</h3>
          
          <div formGroupName="address">
            <div>
              <label for="street" class="block text-sm font-medium text-gray-700 mb-2">
                Rue/Avenue <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input type="text" 
                       id="street"
                       formControlName="street"
                       (input)="onAddressInput($event)"
                       (focus)="showAddressSuggestions = true"
                       (blur)="hideAddressSuggestions()"
                       class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                       placeholder="123 Rue de la Paix"
                       [class.border-red-300]="contactForm.get('address.street')?.invalid && contactForm.get('address.street')?.touched">
                
                <!-- Suggestions d'adresses -->
                <div *ngIf="showAddressSuggestions && addressSuggestions.length > 0" 
                     class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div *ngFor="let suggestion of addressSuggestions" 
                       (mousedown)="selectAddress(suggestion)"
                       class="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm">
                    {{suggestion.display}}
                  </div>
                </div>
              </div>
              <div *ngIf="contactForm.get('address.street')?.invalid && contactForm.get('address.street')?.touched" 
                   class="mt-1 text-sm text-red-600">
                L'adresse est requise.
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700 mb-2">
                  Ville <span class="text-red-500">*</span>
                </label>
                <input type="text" 
                       id="city"
                       formControlName="city"
                       class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                       placeholder="Paris"
                       [class.border-red-300]="contactForm.get('address.city')?.invalid && contactForm.get('address.city')?.touched">
                <div *ngIf="contactForm.get('address.city')?.invalid && contactForm.get('address.city')?.touched" 
                     class="mt-1 text-sm text-red-600">
                  La ville est requise.
                </div>
              </div>
              
              <div>
                <label for="postalCode" class="block text-sm font-medium text-gray-700 mb-2">
                  Code postal <span class="text-red-500">*</span>
                </label>
                <input type="text" 
                       id="postalCode"
                       formControlName="postalCode"
                       class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                       placeholder="75001"
                       [class.border-red-300]="contactForm.get('address.postalCode')?.invalid && contactForm.get('address.postalCode')?.touched">
                <div *ngIf="contactForm.get('address.postalCode')?.invalid && contactForm.get('address.postalCode')?.touched" 
                     class="mt-1 text-sm text-red-600">
                  Le code postal est requis.
                </div>
              </div>
              
              <div>
                <label for="country" class="block text-sm font-medium text-gray-700 mb-2">
                  Pays <span class="text-red-500">*</span>
                </label>
                <select id="country"
                        formControlName="country"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        [class.border-red-300]="contactForm.get('address.country')?.invalid && contactForm.get('address.country')?.touched">
                  <option value="">Sélectionnez</option>
                  <option *ngFor="let country of countries" [value]="country.code">{{country.name}}</option>
                </select>
                <div *ngIf="contactForm.get('address.country')?.invalid && contactForm.get('address.country')?.touched" 
                     class="mt-1 text-sm text-red-600">
                  Le pays est requis.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact d'urgence -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Personne à contacter en cas d'urgence</h3>
          
          <div formGroupName="emergencyContact" class="space-y-4">
            <div>
              <label for="emergencyName" class="block text-sm font-medium text-gray-700 mb-2">
                Nom complet <span class="text-red-500">*</span>
              </label>
              <input type="text" 
                     id="emergencyName"
                     formControlName="name"
                     class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                     placeholder="Nom et prénom"
                     [class.border-red-300]="contactForm.get('emergencyContact.name')?.invalid && contactForm.get('emergencyContact.name')?.touched">
              <div *ngIf="contactForm.get('emergencyContact.name')?.invalid && contactForm.get('emergencyContact.name')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Le nom du contact d'urgence est requis.
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="relationship" class="block text-sm font-medium text-gray-700 mb-2">
                  Lien de parenté <span class="text-red-500">*</span>
                </label>
                <select id="relationship"
                        formControlName="relationship"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        [class.border-red-300]="contactForm.get('emergencyContact.relationship')?.invalid && contactForm.get('emergencyContact.relationship')?.touched">
                  <option value="">Sélectionnez</option>
                  <option value="PARENT">Parent</option>
                  <option value="CONJOINT">Conjoint(e)</option>
                  <option value="FRERE_SOEUR">Frère/Sœur</option>
                  <option value="AMI">Ami(e)</option>
                  <option value="AUTRE">Autre</option>
                </select>
                <div *ngIf="contactForm.get('emergencyContact.relationship')?.invalid && contactForm.get('emergencyContact.relationship')?.touched" 
                     class="mt-1 text-sm text-red-600">
                  Le lien de parenté est requis.
                </div>
              </div>
              
              <div>
                <label for="emergencyPhone" class="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone <span class="text-red-500">*</span>
                </label>
                <input type="tel" 
                       id="emergencyPhone"
                       formControlName="phone"
                       class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                       placeholder="+33123456789"
                       [class.border-red-300]="contactForm.get('emergencyContact.phone')?.invalid && contactForm.get('emergencyContact.phone')?.touched">
                <div *ngIf="contactForm.get('emergencyContact.phone')?.invalid && contactForm.get('emergencyContact.phone')?.touched" 
                     class="mt-1 text-sm text-red-600">
                  Le téléphone du contact d'urgence est requis.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Préférences de notification -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Préférences de notification</h3>
          
          <div class="space-y-3">
            <div class="flex items-center">
              <input id="emailNotifications" 
                     type="checkbox" 
                     formControlName="emailNotifications"
                     class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
              <label for="emailNotifications" class="ml-2 block text-sm text-gray-900">
                Recevoir les notifications par email
              </label>
            </div>
            
            <div class="flex items-center">
              <input id="smsNotifications" 
                     type="checkbox" 
                     formControlName="smsNotifications"
                     class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
              <label for="smsNotifications" class="ml-2 block text-sm text-gray-900">
                Recevoir les notifications par SMS
              </label>
            </div>
          </div>
        </div>

      </form>
    </div>
  `
})
export class ContactInfoStepComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  contactForm!: FormGroup;

  countryCodes = [
    { code: '+33', name: 'France', flag: '🇫🇷' },
    { code: '+213', name: 'Algérie', flag: '🇩🇿' },
    { code: '+212', name: 'Maroc', flag: '🇲🇦' },
    { code: '+216', name: 'Tunisie', flag: '🇹🇳' },
    { code: '+221', name: 'Sénégal', flag: '🇸🇳' },
    { code: '+225', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
    { code: '+237', name: 'Cameroun', flag: '🇨🇲' }
  ];

  countries = [
    { code: 'FR', name: 'France' },
    { code: 'DZ', name: 'Algérie' },
    { code: 'MA', name: 'Maroc' },
    { code: 'TN', name: 'Tunisie' },
    { code: 'SN', name: 'Sénégal' },
    { code: 'CI', name: 'Côte d\'Ivoire' },
    { code: 'CM', name: 'Cameroun' }
  ];

  addressSuggestions: AddressSuggestion[] = [];
  showAddressSuggestions = false;

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

  private initializeForm(): void {
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      emailConfirm: ['', [Validators.required, this.emailMatchValidator.bind(this)]],
      countryCode: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        postalCode: ['', Validators.required],
        country: ['', Validators.required]
      }),
      emergencyContact: this.fb.group({
        name: ['', Validators.required],
        relationship: ['', Validators.required],
        phone: ['', Validators.required]
      }),
      emailNotifications: [true],
      smsNotifications: [false]
    });
  }

  private loadSavedData(): void {
    const formData = this.registrationService.getFormData();
    if (formData.contactInfo) {
      this.contactForm.patchValue(formData.contactInfo);
    }
  }

  private setupFormValidation(): void {
    this.contactForm.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.registrationService.updateFormData('contactInfo', value);
        this.registrationService.markStepValid(4, this.contactForm.valid);
      });
  }

  private emailMatchValidator(control: any) {
    if (!control.value) return null;
    
    const email = this.contactForm?.get('email')?.value;
    return email === control.value ? null : { emailMismatch: true };
  }

  onAddressInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;
    
    if (query.length >= 3) {
      this.geolocationService.searchAddresses(query)
        .pipe(takeUntil(this.destroy$))
        .subscribe(suggestions => {
          this.addressSuggestions = suggestions;
          this.showAddressSuggestions = true;
        });
    } else {
      this.addressSuggestions = [];
      this.showAddressSuggestions = false;
    }
  }

  selectAddress(suggestion: AddressSuggestion): void {
    this.contactForm.patchValue({
      address: {
        street: suggestion.street,
        city: suggestion.city,
        postalCode: suggestion.postalCode,
        country: suggestion.country === 'France' ? 'FR' : suggestion.country
      }
    });
    
    this.addressSuggestions = [];
    this.showAddressSuggestions = false;
  }

  hideAddressSuggestions(): void {
    setTimeout(() => {
      this.showAddressSuggestions = false;
    }, 200);
  }
}