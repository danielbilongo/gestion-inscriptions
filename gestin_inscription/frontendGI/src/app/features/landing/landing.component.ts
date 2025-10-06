import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  animations: [
    trigger('fadeInUp', [
      state('in', style({opacity: 1, transform: 'translateY(0)'})),
      transition('void => *', [
        style({opacity: 0, transform: 'translateY(30px)'}),
        animate(600)
      ])
    ]),
    trigger('slideInLeft', [
      state('in', style({opacity: 1, transform: 'translateX(0)'})),
      transition('void => *', [
        style({opacity: 0, transform: 'translateX(-50px)'}),
        animate(800)
      ])
    ])
  ],
  template: `
    <!-- Hero Section -->
    <section class="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
      </div>
      
      <!-- Navigation -->
      <nav class="relative z-10 px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex items-center space-x-3" [@fadeInUp]>
            <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <i class="fas fa-graduation-cap text-blue-600 text-xl"></i>
            </div>
            <span class="text-white text-xl font-bold">SIGEC</span>
          </div>
          
          <div class="hidden md:flex items-center space-x-8" [@fadeInUp]>
            <a href="#services" class="text-white/80 hover:text-white transition-colors">Services</a>
            <a href="#features" class="text-white/80 hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#contact" class="text-white/80 hover:text-white transition-colors">Contact</a>
            <button (click)="quickAccess('inscription')" 
                    class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
              Candidater
            </button>
            <button (click)="quickAccess('login')" 
                    class="px-4 py-2 bg-white text-blue-900 rounded-lg hover:bg-blue-50 transition-colors">
              Connexion
            </button>
          </div>
        </div>
      </nav>

      <!-- Hero Content -->
      <div class="relative z-10 px-6 py-20">
        <div class="max-w-7xl mx-auto">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <!-- Left Content -->
            <div class="text-white" [@slideInLeft]>
              <h1 class="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Système Intégré de
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                  Gestion de Candidature
                </span>
              </h1>
              
              <p class="text-xl text-blue-100 mb-8 leading-relaxed">
                Simplifiez vos processus d'inscription avec notre solution moderne. 
                Gestion automatisée, suivi en temps réel et interface intuitive pour tous les utilisateurs.
              </p>

              <!-- CTA Buttons -->
              <div class="flex flex-col sm:flex-row gap-4 mb-12">
                <button (click)="selectRole('candidate')" 
                        class="group px-8 py-4 bg-white text-blue-900 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                  <i class="fas fa-user-graduate mr-3 group-hover:scale-110 transition-transform"></i>
                  Espace Candidat
                </button>
                
                <button (click)="selectRole('agent')" 
                        class="group px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-900 transition-all duration-300 transform hover:scale-105">
                  <i class="fas fa-user-tie mr-3 group-hover:scale-110 transition-transform"></i>
                  Espace Agent
                </button>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-3 gap-6">
                <div class="text-center" [@fadeInUp]>
                  <div class="text-3xl font-bold text-cyan-300">1000+</div>
                  <div class="text-blue-200 text-sm">Candidatures traitées</div>
                </div>
                <div class="text-center" [@fadeInUp]>
                  <div class="text-3xl font-bold text-cyan-300">98%</div>
                  <div class="text-blue-200 text-sm">Satisfaction utilisateur</div>
                </div>
                <div class="text-center" [@fadeInUp]>
                  <div class="text-3xl font-bold text-cyan-300">24/7</div>
                  <div class="text-blue-200 text-sm">Support disponible</div>
                </div>
              </div>
            </div>

            <!-- Right Content - Illustration -->
            <div class="relative" [@fadeInUp]>
              <div class="relative z-10">
                <!-- Dashboard Preview -->
                <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex space-x-2">
                      <div class="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div class="text-white/60 text-sm">Dashboard Preview</div>
                  </div>
                  
                  <div class="space-y-3">
                    <div class="h-4 bg-white/20 rounded animate-pulse"></div>
                    <div class="h-4 bg-white/15 rounded animate-pulse w-3/4"></div>
                    <div class="h-4 bg-white/10 rounded animate-pulse w-1/2"></div>
                  </div>
                  
                  <div class="mt-6 grid grid-cols-2 gap-4">
                    <div class="bg-blue-500/30 rounded-lg p-3">
                      <div class="text-white text-sm font-medium">Candidatures</div>
                      <div class="text-2xl font-bold text-white">247</div>
                    </div>
                    <div class="bg-green-500/30 rounded-lg p-3">
                      <div class="text-white text-sm font-medium">Approuvées</div>
                      <div class="text-2xl font-bold text-white">189</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Floating Elements -->
              <div class="absolute -top-4 -right-4 w-20 h-20 bg-cyan-400/20 rounded-full animate-bounce"></div>
              <div class="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-400/20 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div class="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div class="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="py-20 bg-gray-50 relative overflow-hidden group transition-all duration-500">
      <!-- Background Image on Hover -->
      <div class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-0 group-hover:opacity-20 transition-opacity duration-500"
           style="background-image: url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80')"></div>
      
      <!-- Overlay for better text readability -->
      <div class="absolute inset-0 bg-gray-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div class="max-w-7xl mx-auto px-6 relative z-10">
        <div class="text-center mb-16" [@fadeInUp]>
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Nos Services</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Une solution complète pour gérer efficacement vos processus d'inscription et de candidature
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Service Cards -->
          <div class="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" 
               *ngFor="let service of services" [@fadeInUp]>
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <i [class]="service.icon" class="text-white text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">{{service.title}}</h3>
            <p class="text-gray-600 leading-relaxed">{{service.description}}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 bg-white relative overflow-hidden group transition-all duration-500">
      <!-- Background Image on Hover -->
      <div class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-0 group-hover:opacity-15 transition-opacity duration-500"
           style="background-image: url('https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80')"></div>
      
      <!-- Overlay for better text readability -->
      <div class="absolute inset-0 bg-white/85 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div class="max-w-7xl mx-auto px-6 relative z-10">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div [@slideInLeft]>
            <h2 class="text-4xl font-bold text-gray-900 mb-6">
              Fonctionnalités Avancées
            </h2>
            <p class="text-xl text-gray-600 mb-8">
              Découvrez les outils puissants qui rendent notre plateforme unique
            </p>

            <div class="space-y-6">
              <div class="flex items-start space-x-4" *ngFor="let feature of features">
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i [class]="feature.icon" class="text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">{{feature.title}}</h3>
                  <p class="text-gray-600">{{feature.description}}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="relative" [@fadeInUp]>
            <!-- Feature Showcase -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8">
              <div class="bg-white rounded-2xl p-6 shadow-xl">
                <div class="flex items-center justify-between mb-6">
                  <h4 class="text-lg font-semibold text-gray-900">Tableau de Bord</h4>
                  <div class="flex space-x-2">
                    <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span class="text-sm text-gray-500">En ligne</span>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                  <div class="bg-blue-50 rounded-xl p-4">
                    <div class="text-2xl font-bold text-blue-600">156</div>
                    <div class="text-sm text-gray-600">Nouvelles candidatures</div>
                  </div>
                  <div class="bg-green-50 rounded-xl p-4">
                    <div class="text-2xl font-bold text-green-600">89%</div>
                    <div class="text-sm text-gray-600">Taux d'approbation</div>
                  </div>
                </div>
                
                <div class="space-y-3">
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-blue-500 rounded-full"></div>
                      <div>
                        <div class="font-medium text-sm">Marie Dupont</div>
                        <div class="text-xs text-gray-500">Candidature soumise</div>
                      </div>
                    </div>
                    <span class="text-xs text-green-600 font-medium">Nouveau</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden group transition-all duration-500">
      <!-- Background Image on Hover -->
      <div class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-0 group-hover:opacity-25 transition-opacity duration-500"
           style="background-image: url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80')"></div>
      
      <!-- Overlay for better text readability -->
      <div class="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-indigo-700/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div class="max-w-4xl mx-auto text-center px-6 relative z-10" [@fadeInUp]>
        <h2 class="text-4xl font-bold text-white mb-6">
          Prêt à Commencer ?
        </h2>
        <p class="text-xl text-blue-100 mb-8">
          Rejoignez des milliers d'utilisateurs qui font confiance à notre plateforme
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button (click)="selectRole('candidate')" 
                  class="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
            Commencer en tant que Candidat
          </button>
          <button (click)="selectRole('agent')" 
                  class="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105">
            Accès Agent/Admin
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center space-x-3 mb-6">
              <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <i class="fas fa-graduation-cap text-white text-xl"></i>
              </div>
              <span class="text-xl font-bold">SIGEC</span>
            </div>
            <p class="text-gray-400">
              La solution moderne pour vos processus d'inscription et de gestion des candidatures.
            </p>
          </div>
          
          <div>
            <h3 class="font-semibold mb-4">Services</h3>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors">Gestion des candidatures</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Suivi en temps réel</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Notifications automatiques</a></li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold mb-4">Support</h3>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors">Centre d'aide</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div id="contact">
            <h3 class="font-semibold mb-4">Contact</h3>
            <div class="space-y-2 text-gray-400">
              <div class="flex items-center space-x-2">
                <i class="fas fa-envelope"></i>
                <span>contact&#64;sigec.cm</span>
              </div>
              <div class="flex items-center space-x-2">
                <i class="fas fa-phone"></i>
                <span>+237 9 19 66 71 6</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 KFokam-48. Tous droits réservés.</p>
        </div>
      </div>
    </footer>

    <!-- Role Selection Modal -->
    <div *ngIf="showRoleModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-8 max-w-md w-full transform transition-all" [@fadeInUp]>
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-user-check text-blue-600 text-2xl"></i>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Choisir votre rôle</h3>
          <p class="text-gray-600">Sélectionnez votre type de compte pour continuer</p>
        </div>

        <div class="space-y-4">
          <button (click)="proceedToAuth('candidate')" 
                  class="w-full p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <i class="fas fa-user-graduate text-blue-600 text-xl"></i>
              </div>
              <div class="text-left">
                <div class="font-semibold text-gray-900">Candidat</div>
                <div class="text-sm text-gray-600">Soumettre et suivre ma candidature</div>
              </div>
            </div>
          </button>

          <button (click)="proceedToAuth('agent')" 
                  class="w-full p-4 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all group">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <i class="fas fa-user-tie text-green-600 text-xl"></i>
              </div>
              <div class="text-left">
                <div class="font-semibold text-gray-900">Agent/Administrateur</div>
                <div class="text-sm text-gray-600">Gérer les candidatures et utilisateurs</div>
              </div>
            </div>
          </button>
        </div>

        <button (click)="closeModal()" 
                class="w-full mt-6 py-3 text-gray-500 hover:text-gray-700 transition-colors">
          Annuler
        </button>
      </div>
    </div>

    <!-- Candidate Options Modal -->
    <div *ngIf="showCandidateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-8 max-w-md w-full transform transition-all" [@fadeInUp]>
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-user-graduate text-blue-600 text-2xl"></i>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Espace Candidat</h3>
          <p class="text-gray-600">Choisissez votre action</p>
        </div>

        <div class="space-y-4">
          <button (click)="proceedToRegistration()" 
                  class="w-full p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <i class="fas fa-user-plus text-blue-600 text-xl"></i>
              </div>
              <div class="text-left">
                <div class="font-semibold text-gray-900">Nouvelle Candidature</div>
                <div class="text-sm text-gray-600">Créer mon dossier et soumettre ma candidature</div>
              </div>
            </div>
          </button>

          <button (click)="proceedToLogin()" 
                  class="w-full p-4 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all group">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <i class="fas fa-sign-in-alt text-green-600 text-xl"></i>
              </div>
              <div class="text-left">
                <div class="font-semibold text-gray-900">J'ai déjà un compte</div>
                <div class="text-sm text-gray-600">Me connecter pour suivre ma candidature</div>
              </div>
            </div>
          </button>
        </div>

        <button (click)="closeCandidateModal()" 
                class="w-full mt-6 py-3 text-gray-500 hover:text-gray-700 transition-colors">
          Retour
        </button>
      </div>
    </div>
  `
})
export class LandingComponent implements OnInit {
  showRoleModal = false;
  showCandidateModal = false;
  selectedRole: 'candidate' | 'agent' | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  services = [
    {
      icon: 'fas fa-user-plus',
      title: 'Inscription Simplifiée',
      description: 'Interface intuitive pour soumettre facilement vos candidatures avec un processus guidé étape par étape.'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Suivi en Temps Réel',
      description: 'Suivez l\'état de vos candidatures en temps réel avec des notifications automatiques à chaque étape.'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Sécurité Renforcée',
      description: 'Vos données sont protégées par des protocoles de sécurité avancés et un chiffrement de bout en bout.'
    },
    {
      icon: 'fas fa-file-alt',
      title: 'Gestion Documentaire',
      description: 'Upload et gestion sécurisée de tous vos documents avec validation automatique des formats.'
    },
    {
      icon: 'fas fa-bell',
      title: 'Notifications Intelligentes',
      description: 'Recevez des alertes personnalisées par email et SMS pour ne manquer aucune étape importante.'
    },
    {
      icon: 'fas fa-headset',
      title: 'Support 24/7',
      description: 'Notre équipe de support est disponible 24h/24 pour vous accompagner dans vos démarches.'
    }
  ];

  features = [
    {
      icon: 'fas fa-magic',
      title: 'Interface Intuitive',
      description: 'Design moderne et ergonomique adapté à tous les utilisateurs'
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Responsive Design',
      description: 'Accédez à votre compte depuis n\'importe quel appareil'
    },
    {
      icon: 'fas fa-rocket',
      title: 'Performance Optimale',
      description: 'Temps de chargement ultra-rapides et expérience fluide'
    },
    {
      icon: 'fas fa-cogs',
      title: 'Automatisation',
      description: 'Processus automatisés pour gagner du temps et éviter les erreurs'
    }
  ];

  ngOnInit(): void {
    // Vérifier si l'utilisateur est déjà connecté
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e: Event) {
        e.preventDefault();
        const element = e.target as HTMLAnchorElement;
        const target = document.querySelector(element.getAttribute('href')!);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  selectRole(role: 'candidate' | 'agent'): void {
    this.selectedRole = role;
    this.showRoleModal = true;
  }

  proceedToAuth(role: 'candidate' | 'agent'): void {
    // Store the selected role in localStorage for the auth process
    localStorage.setItem('selectedRole', role);
    
    if (role === 'candidate') {
      // Pour les candidats : vérifier s'ils ont un compte ou les diriger vers l'inscription
      this.showCandidateOptions();
    } else {
      // Pour les agents/admins : diriger vers la page de connexion
      this.router.navigate(['/auth/login']);
    }
  }

  showCandidateOptions(): void {
    // Fermer le modal de sélection de rôle
    this.showRoleModal = false;
    
    // Afficher les options pour les candidats
    this.showCandidateModal = true;
  }

  proceedToLogin(): void {
    this.showCandidateModal = false;
    this.router.navigate(['/auth/login']);
  }

  proceedToRegistration(): void {
    this.showCandidateModal = false;
    this.router.navigate(['/inscription']);
  }

  closeModal(): void {
    this.showRoleModal = false;
    this.selectedRole = null;
  }

  closeCandidateModal(): void {
    this.showCandidateModal = false;
    this.showRoleModal = true; // Retour au modal de sélection de rôle
  }

  quickAccess(action: 'inscription' | 'login'): void {
    if (action === 'inscription') {
      // Diriger directement vers le formulaire d'inscription
      localStorage.setItem('selectedRole', 'candidate');
      this.router.navigate(['/inscription']);
    } else {
      // Diriger vers la page de connexion
      this.router.navigate(['/auth/login']);
    }
  }
}
