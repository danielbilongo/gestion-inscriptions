import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { OAuth2Service } from '../../core/services/oauth2.service';
import { RegistrationFormService } from '../../core/services/registration-form.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <!-- Main Container -->
      <div class="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div class="flex flex-col lg:flex-row">
          
          <!-- Left Side - Branding & Visual -->
          <div class="lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 relative overflow-hidden">
            <!-- Background Pattern -->
            <div class="absolute inset-0 opacity-10">
              <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            </div>
            
            <!-- Floating Elements -->
            <div class="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
            <div class="absolute bottom-32 right-16 w-16 h-16 bg-emerald-300/20 rounded-full animate-bounce"></div>
            <div class="absolute top-1/3 right-8 w-12 h-12 bg-teal-300/20 rounded-full animate-pulse delay-1000"></div>
            
            <!-- Content -->
            <div class="relative z-10 flex flex-col justify-center h-full p-8 lg:p-12 text-white">
              <!-- Logo & Brand -->
              <div class="mb-8">
                <div class="flex items-center space-x-3 mb-6">
                  <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <i class="fas fa-graduation-cap text-emerald-600 text-2xl"></i>
                  </div>
                  <span class="text-2xl font-bold">SIGEC</span>
                </div>
                <h1 class="text-4xl lg:text-5xl font-bold leading-tight mb-4">
                  Rejoignez notre
                  <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
                    communauté
                  </span>
                </h1>
                <p class="text-xl text-emerald-100 leading-relaxed">
                  Créez votre compte et accédez à toutes les opportunités éducatives qui vous attendent
                </p>
              </div>

              <!-- Features -->
              <div class="space-y-4">
                <div class="flex items-center space-x-4 group">
                  <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <i class="fas fa-user-check text-emerald-300"></i>
                  </div>
                  <span class="text-emerald-100">Inscription rapide et sécurisée</span>
                </div>
                <div class="flex items-center space-x-4 group">
                  <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <i class="fas fa-rocket text-emerald-300"></i>
                  </div>
                  <span class="text-emerald-100">Accès immédiat à la plateforme</span>
                </div>
                <div class="flex items-center space-x-4 group">
                  <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <i class="fas fa-heart text-emerald-300"></i>
                  </div>
                  <span class="text-emerald-100">Support personnalisé</span>
                </div>
              </div>

              <!-- Stats -->
              <div class="mt-12 grid grid-cols-3 gap-6 text-center">
                <div>
                  <div class="text-2xl font-bold text-emerald-300">5000+</div>
                  <div class="text-xs text-emerald-200">Étudiants</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-emerald-300">100+</div>
                  <div class="text-xs text-emerald-200">Programmes</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-emerald-300">95%</div>
                  <div class="text-xs text-emerald-200">Réussite</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Side - Register Form -->
          <div class="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <!-- Header -->
            <div class="mb-8">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-3xl font-bold text-gray-900">Inscription</h2>
                <a routerLink="/" class="text-gray-400 hover:text-gray-600 transition-colors">
                  <i class="fas fa-times text-xl"></i>
                </a>
              </div>
              
              <p class="text-gray-600 mb-4">
                Créez votre compte pour accéder au formulaire de candidature.
              </p>
              
              <!-- Message d'information -->
              <div class="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <div class="flex items-center">
                  <i class="fas fa-info-circle text-blue-400 mr-3"></i>
                  <p class="text-blue-700 text-sm">
                    Après inscription, vous serez automatiquement redirigé vers le formulaire de candidature.
                  </p>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="error" class="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div class="flex items-center">
                <i class="fas fa-exclamation-triangle text-red-400 mr-3"></i>
                <p class="text-red-700 text-sm">{{ error }}</p>
              </div>
            </div>

            <!-- Success Message -->
            <div *ngIf="successMessage" class="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
              <div class="flex items-center">
                <i class="fas fa-check-circle text-green-400 mr-3"></i>
                <p class="text-green-700 text-sm">{{ successMessage }}</p>
              </div>
            </div>

            <!-- Register Form -->
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- Name Fields Row -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- First Name -->
                <div class="space-y-2">
                  <label for="prenom" class="block text-sm font-semibold text-gray-700">
                    Prénom
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-user text-gray-400"></i>
                    </div>
                    <input id="prenom" type="text" formControlName="prenom" required
                           class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                           placeholder="Votre prénom">
                  </div>
                </div>

                <!-- Last Name -->
                <div class="space-y-2">
                  <label for="nom" class="block text-sm font-semibold text-gray-700">
                    Nom
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-user text-gray-400"></i>
                    </div>
                    <input id="nom" type="text" formControlName="nom" required
                           class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                           placeholder="Votre nom">
                  </div>
                </div>
              </div>

              <!-- Email Field -->
              <div class="space-y-2">
                <label for="email" class="block text-sm font-semibold text-gray-700">
                  Adresse email
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-envelope text-gray-400"></i>
                  </div>
                  <input id="email" type="email" formControlName="email" required
                         class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                         placeholder="votre@email.com">
                </div>
              </div>

              <!-- Phone Field -->
              <div class="space-y-2">
                <label for="telephone" class="block text-sm font-semibold text-gray-700">
                  Téléphone <span class="text-gray-400 text-xs">(optionnel)</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-phone text-gray-400"></i>
                  </div>
                  <input id="telephone" type="tel" formControlName="telephone"
                         class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                         placeholder="+237 6XX XXX XXX">
                </div>
              </div>

              <!-- Password Field -->
              <div class="space-y-2">
                <label for="motDePasse" class="block text-sm font-semibold text-gray-700">
                  Mot de passe
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-lock text-gray-400"></i>
                  </div>
                  <input id="motDePasse" [type]="showPassword ? 'text' : 'password'" formControlName="motDePasse" required
                         class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                         placeholder="Créez un mot de passe sécurisé">
                  <button type="button" (click)="showPassword = !showPassword"
                          class="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors">
                    <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-gray-400 hover:text-gray-600"></i>
                  </button>
                </div>
                
                <!-- Conditions de validation du mot de passe -->
                <div class="mt-2 p-3 bg-gray-50 rounded-lg border">
                  <p class="text-xs font-medium text-gray-700 mb-2">Le mot de passe doit contenir :</p>
                  <div class="space-y-1">
                    <div class="flex items-center text-xs">
                      <i class="fas fa-check-circle text-green-500 mr-2" *ngIf="hasMinLength(); else redX"></i>
                      <ng-template #redX><i class="fas fa-times-circle text-red-400 mr-2"></i></ng-template>
                      <span [class]="hasMinLength() ? 'text-green-600' : 'text-gray-600'">Au moins 8 caractères</span>
                    </div>
                    <div class="flex items-center text-xs">
                      <i class="fas fa-check-circle text-green-500 mr-2" *ngIf="hasLowercase(); else redX2"></i>
                      <ng-template #redX2><i class="fas fa-times-circle text-red-400 mr-2"></i></ng-template>
                      <span [class]="hasLowercase() ? 'text-green-600' : 'text-gray-600'">Une lettre minuscule (a-z)</span>
                    </div>
                    <div class="flex items-center text-xs">
                      <i class="fas fa-check-circle text-green-500 mr-2" *ngIf="hasUppercase(); else redX3"></i>
                      <ng-template #redX3><i class="fas fa-times-circle text-red-400 mr-2"></i></ng-template>
                      <span [class]="hasUppercase() ? 'text-green-600' : 'text-gray-600'">Une lettre majuscule (A-Z)</span>
                    </div>
                    <div class="flex items-center text-xs">
                      <i class="fas fa-check-circle text-green-500 mr-2" *ngIf="hasNumber(); else redX4"></i>
                      <ng-template #redX4><i class="fas fa-times-circle text-red-400 mr-2"></i></ng-template>
                      <span [class]="hasNumber() ? 'text-green-600' : 'text-gray-600'">Un chiffre (0-9)</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Terms and Conditions -->
              <div class="flex items-start space-x-3">
                <input type="checkbox" formControlName="acceptTerms" required
                       class="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-1">
                <label class="text-sm text-gray-600 leading-relaxed">
                  J'accepte les 
                  <a href="#" class="text-emerald-600 hover:text-emerald-800 font-medium">conditions d'utilisation</a>
                  et la 
                  <a href="#" class="text-emerald-600 hover:text-emerald-800 font-medium">politique de confidentialité</a>
                </label>
              </div>

              <!-- Submit Button -->
              <button type="submit" [disabled]="loading || registerForm.invalid"
                      class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                S'inscrire
              </button>
            </form>

            <!-- Divider -->
            <div class="my-8">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-200"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-4 bg-white text-gray-500 font-medium">Ou s'inscrire avec</span>
                </div>
              </div>
            </div>

            <!-- Social Registration -->
            <div class="grid grid-cols-2 gap-4 mb-8">
              <button (click)="registerWithGoogle()" type="button"
                      class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:scale-[1.02]">
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>

              <button (click)="registerWithMicrosoft()" type="button"
                      class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:scale-[1.02]">
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#00A4EF" d="M13 1h10v10H13z"/>
                  <path fill="#7FBA00" d="M1 13h10v10H1z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
                Microsoft
              </button>
            </div>

            <!-- Footer Links -->
            <div class="text-center space-y-3">
              <p class="text-sm text-gray-600">
                Vous avez déjà un compte ?
                <a routerLink="/auth/login" class="font-semibold text-emerald-600 hover:text-emerald-800 ml-1">
                  Se connecter
                </a>
              </p>
              <a routerLink="/" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
                <i class="fas fa-arrow-left mr-2"></i>
                Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';
  successMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private oauth2Service: OAuth2Service,
    private registrationFormService: RegistrationFormService
  ) {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      motDePasse: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)]],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      const userRole = this.authService.getUserRole();
      switch (userRole) {
        case 'CANDIDATE':
          this.router.navigate(['/candidate/dashboard']);
          break;
        case 'AGENT':
          this.router.navigate(['/agent/dashboard']);
          break;
        case 'SUPER_ADMIN':
          this.router.navigate(['/admin/dashboard']);
          break;
        default:
          this.router.navigate(['/candidate/dashboard']);
      }
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.error = '';
    this.successMessage = '';
    
    const userData = this.registerForm.value;

    this.authService.register(userData).subscribe({
      next: (user) => {
        this.successMessage = 'Inscription réussie ! Redirection vers le formulaire de candidature...';
        this.loading = false;
        
        console.log('User registered and authenticated:', user);
        
        // Recharger les données du formulaire pour l'utilisateur authentifié
        this.registrationFormService.reloadAfterAuth();
        
        // Rediriger selon le rôle utilisateur
        setTimeout(() => {
          const userRole = this.authService.getUserRole();
          let redirectPath = '/inscription'; // Default pour CANDIDATE
          
          switch (userRole) {
            case 'AGENT':
              redirectPath = '/agent/dashboard';
              break;
            case 'SUPER_ADMIN':
              redirectPath = '/admin/dashboard';
              break;
            default:
              redirectPath = '/inscription';
          }
          
          this.router.navigate([redirectPath]).then(() => {
            console.log(`Redirection vers ${redirectPath} réussie`);
          }).catch(err => {
            console.error('Erreur de redirection:', err);
            this.router.navigate(['/candidate/dashboard']);
          });
        }, 1000);
      },
      error: (error) => {
        console.error('Registration error:', error);
        console.log('Error status:', error.status);
        console.log('Error body:', error.error);
        
        // Afficher un message plus informatif pour guider l'utilisateur
        if (error.status === 400 && error.error?.error) {
          this.error = error.error.error;
        } else if (error.status === 400 && error.error) {
          // Fallback si la structure est différente
          this.error = typeof error.error === 'string' ? error.error : 
                      error.error.message || 
                      'L\'inscription directe n\'est pas disponible. Utilisez les boutons Google ou Microsoft ci-dessous.';
        } else {
          this.error = 'L\'inscription directe n\'est pas disponible. Utilisez les boutons Google ou Microsoft ci-dessous.';
        }
        this.loading = false;
      }
    });
  }

  registerWithGoogle(): void {
    this.oauth2Service.loginWithGoogle();
  }

  registerWithMicrosoft(): void {
    this.oauth2Service.loginWithMicrosoft();
  }

  // Méthodes de validation du mot de passe
  hasMinLength(): boolean {
    const password = this.registerForm.get('motDePasse')?.value || '';
    return password.length >= 8;
  }

  hasLowercase(): boolean {
    const password = this.registerForm.get('motDePasse')?.value || '';
    return /[a-z]/.test(password);
  }

  hasUppercase(): boolean {
    const password = this.registerForm.get('motDePasse')?.value || '';
    return /[A-Z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.registerForm.get('motDePasse')?.value || '';
    return /\d/.test(password);
  }
}