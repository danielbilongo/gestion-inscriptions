import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { OAuth2Service } from '../../core/services/oauth2.service';
import { RecaptchaService } from '../../core/services/recaptcha.service';
import { RegistrationFormService } from '../../core/services/registration-form.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <!-- Main Container -->
      <div class="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div class="flex flex-col lg:flex-row">
          
          <!-- Left Side - Branding & Visual -->
          <div class="lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
            <!-- Background Pattern -->
            <div class="absolute inset-0 opacity-10">
              <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            </div>
            
            <!-- Floating Elements -->
            <div class="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
            <div class="absolute bottom-32 right-16 w-16 h-16 bg-cyan-300/20 rounded-full animate-bounce"></div>
            <div class="absolute top-1/3 right-8 w-12 h-12 bg-indigo-300/20 rounded-full animate-pulse delay-1000"></div>
            
            <!-- Content -->
            <div class="relative z-10 flex flex-col justify-center h-full p-8 lg:p-12 text-white">
              <!-- Logo & Brand -->
              <div class="mb-8">
                <div class="flex items-center space-x-3 mb-6">
                  <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <i class="fas fa-graduation-cap text-blue-600 text-2xl"></i>
                  </div>
                  <span class="text-2xl font-bold">SIGEC</span>
                </div>
                <h1 class="text-4xl lg:text-5xl font-bold leading-tight mb-4">
                  Connectez-vous à votre
                  <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                    avenir
                  </span>
                </h1>
                <p class="text-xl text-blue-100 leading-relaxed">
                  Accédez à votre espace personnel et gérez vos candidatures en toute simplicité
                </p>
              </div>

              <!-- Features -->
              <div class="space-y-4">
                <div class="flex items-center space-x-4 group">
                  <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <i class="fas fa-shield-check text-cyan-300"></i>
                  </div>
                  <span class="text-blue-100">Sécurité de niveau bancaire</span>
                </div>
                <div class="flex items-center space-x-4 group">
                  <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <i class="fas fa-clock text-cyan-300"></i>
                  </div>
                  <span class="text-blue-100">Suivi en temps réel</span>
                </div>
                <div class="flex items-center space-x-4 group">
                  <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <i class="fas fa-mobile-alt text-cyan-300"></i>
                  </div>
                  <span class="text-blue-100">Accessible partout</span>
                </div>
              </div>

              <!-- Stats -->
              <div class="mt-12 grid grid-cols-3 gap-6 text-center">
                <div>
                  <div class="text-2xl font-bold text-cyan-300">1000+</div>
                  <div class="text-xs text-blue-200">Candidatures</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-cyan-300">98%</div>
                  <div class="text-xs text-blue-200">Satisfaction</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-cyan-300">24/7</div>
                  <div class="text-xs text-blue-200">Support</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Side - Login Form -->
          <div class="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <!-- Header -->
            <div class="mb-8">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-3xl font-bold text-gray-900">Connexion</h2>
                <a routerLink="/" class="text-gray-400 hover:text-gray-600 transition-colors">
                  <i class="fas fa-times text-xl"></i>
                </a>
              </div>
              
              <p class="text-gray-600 mb-4">
                Ravi de vous revoir ! Connectez-vous à votre compte.
              </p>

              <!-- Role Badge -->
              <div *ngIf="selectedRole" class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4"
                   [class]="selectedRole === 'candidate' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'">
                <i [class]="selectedRole === 'candidate' ? 'fas fa-user-graduate' : 'fas fa-user-tie'" class="mr-2"></i>
                {{selectedRole === 'candidate' ? 'Espace Candidat' : 'Espace Agent'}}
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="error" class="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div class="flex items-center">
                <i class="fas fa-exclamation-triangle text-red-400 mr-3"></i>
                <p class="text-red-700 text-sm">{{ error }}</p>
              </div>
            </div>

            <!-- Login Form -->
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- Email Field -->
              <div class="space-y-2">
                <label for="username" class="block text-sm font-semibold text-gray-700">
                  Adresse email
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-envelope text-gray-400"></i>
                  </div>
                  <input id="username" type="email" formControlName="username" required
                         class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                         placeholder="admin@test.com">
                </div>
              </div>

              <!-- Password Field -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label for="password" class="block text-sm font-semibold text-gray-700">
                    Mot de passe
                  </label>
                  <a routerLink="/" fragment="contact" class="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Contacter l'admin
                  </a>
                </div>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-lock text-gray-400"></i>
                  </div>
                  <input id="password" [type]="showPassword ? 'text' : 'password'" formControlName="password" required
                         class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                         placeholder="Entrez votre mot de passe">
                  <button type="button" (click)="showPassword = !showPassword"
                          class="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors">
                    <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-gray-400 hover:text-gray-600"></i>
                  </button>
                </div>
              </div>

              <!-- Remember Me -->
              <div class="flex items-center justify-between">
                <label class="flex items-center">
                  <input type="checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                  <span class="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
                </label>
              </div>

              <!-- Submit Button -->
              <button type="submit" [disabled]="loading || loginForm.invalid"
                      class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <span *ngIf="loading" class="inline-flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </span>
                <span *ngIf="!loading" class="flex items-center justify-center">
                  <i class="fas fa-sign-in-alt mr-2"></i>
                  Se connecter
                </span>
              </button>
            </form>

            <!-- Divider -->
            <div class="my-8">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-200"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-4 bg-white text-gray-500 font-medium">Ou continuer avec</span>
                </div>
              </div>
            </div>



            <!-- Social Login -->
            <div class="space-y-4 mb-8">
              <!-- Vrais comptes OAuth2 -->
              <div class="grid grid-cols-2 gap-4">
                <button (click)="loginWithGoogle()" type="button"
                        class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:scale-[1.02]">
                  <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>

                <button (click)="loginWithMicrosoft()" type="button"
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


            </div>

            <!-- Footer Links -->
            <div class="text-center space-y-3">
              <p class="text-sm text-gray-600">
                Pas encore de compte ?
                <a routerLink="/auth/register" class="font-semibold text-blue-600 hover:text-blue-800 ml-1">
                  Créer un compte
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
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  showPassword = false;
  showRecaptcha = false;
  selectedRole: string = '';
  isDevelopmentMode = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private oauth2Service: OAuth2Service,
    private recaptchaService: RecaptchaService,
    private registrationFormService: RegistrationFormService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
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
    
    // Récupérer le rôle sélectionné depuis la landing page
    this.selectedRole = localStorage.getItem('selectedRole') || '';
    
    // Vérifier si on est en mode développement
    this.isDevelopmentMode = this.oauth2Service.isDevelopmentMode();
    
    // Charger reCAPTCHA
    this.recaptchaService.loadRecaptchaScript().catch(error => {
      console.warn('Failed to load reCAPTCHA:', error);
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = '';
    
    const { username, password } = this.loginForm.value;

    try {
      // Tenter la connexion d'abord
      await this.authService.login(username, password).toPromise();
      
      // Recharger les données du formulaire pour l'utilisateur authentifié
      this.registrationFormService.reloadAfterAuth();
      
      // Redirection selon le rôle utilisateur
      const returnUrl = this.route.snapshot.queryParams['returnUrl'];
      if (returnUrl) {
        this.router.navigateByUrl(returnUrl);
      } else {
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
      
    } catch (error: any) {
      // Si reCAPTCHA est requis
      if (error.error?.recaptchaRequired) {
        this.showRecaptcha = true;
        this.error = 'Veuillez compléter la vérification reCAPTCHA';
        
        try {
          // Exécuter reCAPTCHA et réessayer
          const recaptchaToken = await this.recaptchaService.executeRecaptcha('login');
          await this.authService.loginWithRecaptcha(username, password, recaptchaToken).toPromise();
          
          // Recharger les données du formulaire pour l'utilisateur authentifié
          this.registrationFormService.reloadAfterAuth();
          
          // Redirection selon le rôle utilisateur
          const returnUrl = this.route.snapshot.queryParams['returnUrl'];
          if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
          } else {
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
          
        } catch (recaptchaError: any) {
          if (recaptchaError.error && recaptchaError.error.error) {
            this.error = recaptchaError.error.error;
          } else {
            this.error = recaptchaError.message || 'Erreur de vérification reCAPTCHA';
          }
        }
      } else {
        // Extraire le message d'erreur du backend
        if (error.error && error.error.error) {
          this.error = error.error.error;
        } else if (error.message) {
          this.error = error.message;
        } else {
          this.error = 'Erreur de connexion. Vérifiez vos identifiants.';
        }
      }
      
      this.loading = false;
    }
  }

  loginWithGoogle(): void {
    this.oauth2Service.loginWithGoogle();
  }

  loginWithMicrosoft(): void {
    this.oauth2Service.loginWithMicrosoft();
  }

  loginWithGoogleTest(): void {
    this.oauth2Service.loginWithGoogleTest();
  }

  loginWithMicrosoftTest(): void {
    this.oauth2Service.loginWithMicrosoftTest();
  }
}