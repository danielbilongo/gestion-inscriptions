import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AuthTestService } from '../../core/services/auth-test.service';
import { NotificationService } from '../../core/services/notification.service';
import { Role } from '../../core/models/models';
import { filter } from 'rxjs/operators';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, FormsModule],
  template: `
    <div class="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex overflow-hidden">
      <!-- Sidebar -->
      <div class="w-64 bg-gradient-to-b from-primary-800 to-primary-900 text-white shadow-lg flex flex-col fixed h-full z-40">
        <!-- Logo/Brand -->
        <div class="p-6 border-b border-white/10 flex-shrink-0 bg-white/5 backdrop-blur-xs">
          <h2 class="text-xl font-bold text-white">Gestion Inscription</h2>
        </div>
        
        <!-- Navigation Menu -->
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <a *ngFor="let item of menuItems; let i = index" 
             [routerLink]="item.route"
             routerLinkActive="bg-white/15 text-white border-r-2 border-white/60"
             class="group flex items-center px-4 py-3 text-white/90 rounded-lg hover:bg-white/10 transition-all duration-200 animate-slideInLeft"
             [style.animation-delay]="i * 50 + 'ms'">
            <i [class]="item.icon" class="w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110"></i>
            <span class="font-medium">{{item.label}}</span>
          </a>
        </nav>
        
        <!-- Logout Button -->
        <div class="p-4 border-t border-white/10 flex-shrink-0">
          <button (click)="logout()" 
                  class="w-full flex items-center px-4 py-3 text-red-100 rounded-lg hover:bg-white/10 transition-colors duration-200">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span class="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col ml-64 animate-fadeIn">
        <!-- Header -->
        <header class="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/60 fixed top-0 right-0 left-64 z-30 transition-all duration-300 animate-slideDown">
          <div class="flex items-center justify-between px-6 py-4">
            <!-- Page Title -->
            <div class="flex items-center">
              <h1 class="text-2xl font-semibold text-gray-900">{{pageTitle}}</h1>
            </div>
            
            <!-- Search Bar -->
            <div class="flex-1 max-w-lg mx-8">
              <div class="relative">
                <input type="text" 
                       [(ngModel)]="searchQuery"
                       (ngModelChange)="onSearch()"
                       placeholder="Rechercher..." 
                       class="input-enhanced pl-10">
                <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
            
            <!-- User Profile -->
            <div class="flex items-center space-x-4">
              <!-- Notifications -->
              <div class="relative">
                <button (click)="toggleNotifications()" class="p-2 text-gray-400 hover:text-gray-600 relative">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19c-5 0-9-4-9-9s4-9 9-9 9 4 9 9c0 .273-.02.543-.06.81L15 15H9v4z"></path>
                  </svg>
                  <span *ngIf="unreadNotifications > 0" 
                        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {{unreadNotifications}}
                  </span>
                </button>
              </div>
              
              <!-- User Menu -->
              <div class="relative">
                <button (click)="toggleUserMenu()" 
                        class="user-menu-button flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <!-- Profile Photo -->
                  <div class="relative">
                    <img *ngIf="currentUser?.profilePhoto" 
                         [src]="currentUser.profilePhoto" 
                         [alt]="currentUser.prenom + ' ' + currentUser.nom"
                         class="h-8 w-8 rounded-full object-cover">
                    <div *ngIf="!currentUser?.profilePhoto" 
                         class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                      <span class="text-sm font-medium text-white">
                        {{currentUser?.prenom?.[0]}}{{currentUser?.nom?.[0]}}
                      </span>
                    </div>
                  </div>
                  
                  <!-- User Info -->
                  <div class="text-left">
                    <div class="text-sm font-medium text-gray-900">
                      {{currentUser?.prenom}} {{currentUser?.nom}}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{getUserRoleLabel()}}
                    </div>
                  </div>
                  
                  <!-- Dropdown Arrow -->
                  <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <!-- User Dropdown Menu -->
                <div *ngIf="showUserMenu" 
                     class="user-menu-dropdown absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div class="py-2">
                    <div class="px-4 py-3 border-b border-gray-200">
                      <p class="text-sm font-medium text-gray-900">{{currentUser?.prenom}} {{currentUser?.nom}}</p>
                      <p class="text-sm text-gray-500">{{currentUser?.email}}</p>
                    </div>
                    
                    <a routerLink="/profile" 
                       class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Mon Profil
                    </a>
                    
                    <a *ngIf="isAdmin()" 
                       routerLink="/settings" 
                       class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      Paramètres
                    </a>
                    
                    <div class="border-t border-gray-200 mt-2 pt-2">
                      <button (click)="testAuth()" 
                              class="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 mb-2">
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Test Auth
                      </button>
                      <button (click)="logout()" 
                              class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <!-- Page Content -->
        <main class="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100" style="margin-top: 80px; margin-bottom: 60px;">
          <router-outlet></router-outlet>
        </main>
        
        <!-- Footer -->
        <footer class="bg-white border-t border-gray-200 py-4 px-6 fixed bottom-0 right-0 left-64 z-30">
          <div class="text-center text-sm text-gray-500">
            © 2025 KFokam-48. Tous droits réservés.
          </div>
        </footer>
      </div>
    </div>
  `
})
export class LayoutComponent implements OnInit {
  currentUser: any;
  pageTitle = 'Tableau de bord';
  searchQuery = '';
  showUserMenu = false;
  showNotifications = false;
  unreadNotifications = 0;
  menuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private authTestService: AuthTestService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    console.log('=== LAYOUT DEBUG ===');
    console.log('Layout - Current user:', this.currentUser);
    console.log('Layout - User roles:', this.currentUser?.roles);
    console.log('Layout - Token exists:', !!this.authService.getToken());
    console.log('Layout - Is authenticated:', this.authService.isAuthenticated());
    console.log('Layout - User role (single):', this.authService.getUserRole());
    this.setupMenuItems();
    this.updatePageTitle();
    this.loadNotificationsData();
    
    // Écouter les changements de route pour mettre à jour le titre
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updatePageTitle();
    });
    
    // S'abonner aux notifications non lues
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadNotifications = count;
    });
  }

  setupMenuItems() {
    const allMenuItems: MenuItem[] = [
      {
        id: 'dashboard',
        label: 'Tableau de bord',
        icon: 'fas fa-tachometer-alt',
        route: '/dashboard',
        roles: ['CANDIDAT', 'AGENT', 'ADMIN']
      },
      {
        id: 'dossiers',
        label: 'Mes Dossiers',
        icon: 'fas fa-folder',
        route: '/candidate/dossiers',
        roles: ['CANDIDAT']
      },
      {
        id: 'agent-dossiers',
        label: 'Gestion Dossiers',
        icon: 'fas fa-folder-open',
        route: '/agent/dossiers',
        roles: ['AGENT']
      },
      {
        id: 'admin-dossiers',
        label: 'Gestion Dossiers',
        icon: 'fas fa-folder-open',
        route: '/admin/dossiers',
        roles: ['ADMIN']
      },
      {
        id: 'candidats',
        label: 'Candidats',
        icon: 'fas fa-users',
        route: '/admin/candidats',
        roles: ['ADMIN']
      },
      {
        id: 'documents',
        label: 'Documents',
        icon: 'fas fa-file-alt',
        route: '/agent/documents',
        roles: ['AGENT', 'ADMIN']
      },
      {
        id: 'agents',
        label: 'Gestion Agents',
        icon: 'fas fa-user-tie',
        route: '/admin/agents',
        roles: ['ADMIN']
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: 'fas fa-bell',
        route: '/candidate/notifications',
        roles: ['CANDIDAT', 'AGENT', 'ADMIN']
      },
      {
        id: 'reports',
        label: 'Rapports',
        icon: 'fas fa-chart-bar',
        route: '/admin/reports',
        roles: ['ADMIN']
      },
      {
        id: 'inscription',
        label: 'Formulaire Inscription',
        icon: 'fas fa-user-plus',
        route: '/inscription',
        roles: ['CANDIDAT', 'ADMIN']
      },
      {
        id: 'settings',
        label: 'Paramètres',
        icon: 'fas fa-cog',
        route: '/settings',
        roles: ['ADMIN']
      }
    ];

    this.menuItems = allMenuItems.filter(item => 
      item.roles.some(role => {
        switch(role) {
          case 'CANDIDAT': return this.authService.isCandidate();
          case 'AGENT': return this.authService.isAgent();
          case 'ADMIN': return this.authService.isAdmin();
          default: return false;
        }
      })
    );
    console.log('All menu items:', allMenuItems);
    console.log('User roles (mapped):', this.currentUser?.roles?.map((r: string) => {
      const cleanRole = r.replace('ROLE_', '');
      if (cleanRole === 'CANDIDATE') return 'CANDIDAT';
      if (cleanRole === 'SUPER_ADMIN') return 'ADMIN';
      return cleanRole;
    }));
    console.log('Filtered menu items:', this.menuItems);
  }

  updatePageTitle() {
    const currentRoute = this.router.url;
    const menuItem = this.menuItems.find(item => {
      if (item.route === '/dashboard') {
        return currentRoute === '/' || currentRoute === '/dashboard';
      }
      return currentRoute.startsWith(item.route);
    });
    this.pageTitle = menuItem ? menuItem.label : 'Tableau de bord';
  }

  onSearch() {
    console.log('Recherche:', this.searchQuery);
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  getUserRoleLabel(): string {
    if (this.authService.isAdmin()) return 'Administrateur';
    if (this.authService.isAgent()) return 'Agent';
    if (this.authService.isCandidate()) return 'Candidat';
    return 'Utilisateur';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout() {
    this.authService.logout();
  }

  loadNotificationsData() {
    if (this.authService.isAuthenticated()) {
      this.notificationService.getMyNotifications().subscribe({
        next: (response) => {
          if (response.success) {
            const unreadCount = response.notifications?.filter((n: any) => !n.read)?.length || 0;
            this.notificationService.updateUnreadCount(unreadCount);
          }
        },
        error: (error) => {
          console.log('Erreur chargement notifications:', error);
        }
      });
    }
  }

  testAuth() {
    console.log('=== AUTH TEST ===');
    console.log('Current user:', this.authService.currentUserValue);
    console.log('Token:', this.authService.getToken());
    console.log('Is authenticated:', this.authService.isAuthenticated());
    
    // Test 1: Status endpoint (public)
    this.authTestService.testAuthStatus().subscribe({
      next: (result) => {
        console.log('✅ Public auth test result:', result);
        
        // Test 2: Protected endpoint
        this.authTestService.testProtectedEndpoint().subscribe({
          next: (protectedResult) => {
            console.log('✅ Protected endpoint test result:', protectedResult);
            alert('✅ All tests passed!\n\nPublic: ' + JSON.stringify(result) + '\n\nProtected: ' + JSON.stringify(protectedResult));
          },
          error: (protectedError) => {
            console.error('❌ Protected endpoint test failed:', protectedError);
            alert('❌ Protected endpoint failed: ' + protectedError.message + '\n\nBut public endpoint worked: ' + JSON.stringify(result));
          }
        });
      },
      error: (error) => {
        console.error('❌ Public auth test failed:', error);
        alert('❌ Public auth test failed: ' + error.message);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const userMenuButton = target.closest('.user-menu-button');
    const userMenuDropdown = target.closest('.user-menu-dropdown');
    
    if (!userMenuButton && !userMenuDropdown) {
      this.showUserMenu = false;
      this.showNotifications = false;
    }
  }
}