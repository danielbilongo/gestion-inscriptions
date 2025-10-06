import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-role-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 class="text-2xl font-bold mb-6 text-gray-900">Debug des Rôles Utilisateur</h2>
      
      <div class="space-y-6">
        <!-- Informations utilisateur brutes -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-3">Informations Utilisateur Brutes</h3>
          <pre class="text-sm bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">{{userInfo | json}}</pre>
        </div>

        <!-- Token JWT décodé -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-3">Token JWT Décodé</h3>
          <pre class="text-sm bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">{{decodedToken | json}}</pre>
        </div>

        <!-- Tests de rôles -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-3">Tests de Vérification des Rôles</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-3 border rounded" [class.bg-green-100]="isCandidate" [class.bg-red-100]="!isCandidate">
              <div class="font-medium">isCandidate()</div>
              <div class="text-sm">{{isCandidate ? '✅ OUI' : '❌ NON'}}</div>
            </div>
            <div class="p-3 border rounded" [class.bg-green-100]="isAgent" [class.bg-red-100]="!isAgent">
              <div class="font-medium">isAgent()</div>
              <div class="text-sm">{{isAgent ? '✅ OUI' : '❌ NON'}}</div>
            </div>
            <div class="p-3 border rounded" [class.bg-green-100]="isAdmin" [class.bg-red-100]="!isAdmin">
              <div class="font-medium">isAdmin()</div>
              <div class="text-sm">{{isAdmin ? '✅ OUI' : '❌ NON'}}</div>
            </div>
          </div>
        </div>

        <!-- Tests de rôles spécifiques -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-3">Tests hasRole() Spécifiques</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div class="p-2 border rounded" [class.bg-green-100]="hasRole('AGENT')" [class.bg-red-100]="!hasRole('AGENT')">
              hasRole('AGENT'): {{hasRole('AGENT') ? '✅' : '❌'}}
            </div>
            <div class="p-2 border rounded" [class.bg-green-100]="hasRole('ROLE_AGENT')" [class.bg-red-100]="!hasRole('ROLE_AGENT')">
              hasRole('ROLE_AGENT'): {{hasRole('ROLE_AGENT') ? '✅' : '❌'}}
            </div>
            <div class="p-2 border rounded" [class.bg-green-100]="hasRole('ADMIN')" [class.bg-red-100]="!hasRole('ADMIN')">
              hasRole('ADMIN'): {{hasRole('ADMIN') ? '✅' : '❌'}}
            </div>
            <div class="p-2 border rounded" [class.bg-green-100]="hasRole('SUPER_ADMIN')" [class.bg-red-100]="!hasRole('SUPER_ADMIN')">
              hasRole('SUPER_ADMIN'): {{hasRole('SUPER_ADMIN') ? '✅' : '❌'}}
            </div>
            <div class="p-2 border rounded" [class.bg-green-100]="hasRole('CANDIDATE')" [class.bg-red-100]="!hasRole('CANDIDATE')">
              hasRole('CANDIDATE'): {{hasRole('CANDIDATE') ? '✅' : '❌'}}
            </div>
            <div class="p-2 border rounded" [class.bg-green-100]="hasRole('CANDIDAT')" [class.bg-red-100]="!hasRole('CANDIDAT')">
              hasRole('CANDIDAT'): {{hasRole('CANDIDAT') ? '✅' : '❌'}}
            </div>
          </div>
        </div>

        <!-- Simulation du bouton traiter -->
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 class="text-lg font-semibold mb-3 text-blue-900">Simulation du Bouton "Traiter"</h3>
          <div class="space-y-3">
            <div class="text-sm text-blue-800">
              Condition: *ngIf="isAgent() || isAdmin()"
            </div>
            <div class="text-sm">
              Résultat: {{(isAgent || isAdmin) ? '✅ BOUTON VISIBLE' : '❌ BOUTON MASQUÉ'}}
            </div>
            <button 
              *ngIf="isAgent || isAdmin"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Traiter (Bouton de test)
            </button>
            <div *ngIf="!(isAgent || isAdmin)" class="text-red-600 font-medium">
              ❌ Le bouton "Traiter" n'est pas visible car l'utilisateur n'a pas les rôles AGENT ou ADMIN
            </div>
          </div>
        </div>

        <!-- Actions de test -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-3">Actions de Test</h3>
          <div class="space-x-2">
            <button (click)="refreshData()" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Actualiser les Données
            </button>
            <button (click)="logToConsole()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Log vers Console
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RoleDebugComponent implements OnInit {
  userInfo: any = {};
  decodedToken: any = {};
  isCandidate = false;
  isAgent = false;
  isAdmin = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.userInfo = this.authService.currentUserValue;
    this.decodedToken = this.decodeJWT(this.authService.getToken() || '');
    
    this.isCandidate = this.authService.isCandidate();
    this.isAgent = this.authService.isAgent();
    this.isAdmin = this.authService.isAdmin();
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  private decodeJWT(token: string): any {
    try {
      if (!token) return {};
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Erreur décodage JWT:', error);
      return {};
    }
  }

  logToConsole() {
    console.log('=== ROLE DEBUG COMPONENT ===');
    console.log('User Info:', this.userInfo);
    console.log('Decoded Token:', this.decodedToken);
    console.log('isCandidate():', this.isCandidate);
    console.log('isAgent():', this.isAgent);
    console.log('isAdmin():', this.isAdmin);
    console.log('Raw roles from user:', this.userInfo?.roles);
    console.log('Token exists:', !!this.authService.getToken());
    console.log('Is authenticated:', this.authService.isAuthenticated());
  }
}