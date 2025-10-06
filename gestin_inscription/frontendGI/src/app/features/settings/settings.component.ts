import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-900">Paramètres du Système</h2>

      <!-- Paramètres généraux -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium mb-4">Paramètres Généraux</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nom de l'application</label>
            <input type="text" [(ngModel)]="settings.appName"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea [(ngModel)]="settings.appDescription" rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
          </div>
          
          <div class="flex items-center">
            <input type="checkbox" [(ngModel)]="settings.maintenanceMode" id="maintenance"
                   class="h-4 w-4 text-blue-600 border-gray-300 rounded">
            <label for="maintenance" class="ml-2 text-sm text-gray-700">Mode maintenance</label>
          </div>
        </div>
      </div>

      <!-- Paramètres d'inscription -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium mb-4">Paramètres d'Inscription</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date limite d'inscription</label>
            <input type="date" [(ngModel)]="settings.inscriptionDeadline"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre max de candidats</label>
            <input type="number" [(ngModel)]="settings.maxCandidats"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md">
          </div>
          
          <div class="flex items-center">
            <input type="checkbox" [(ngModel)]="settings.autoValidation" id="autoValidation"
                   class="h-4 w-4 text-blue-600 border-gray-300 rounded">
            <label for="autoValidation" class="ml-2 text-sm text-gray-700">Validation automatique</label>
          </div>
          
          <div class="flex items-center">
            <input type="checkbox" [(ngModel)]="settings.emailNotifications" id="emailNotifications"
                   class="h-4 w-4 text-blue-600 border-gray-300 rounded">
            <label for="emailNotifications" class="ml-2 text-sm text-gray-700">Notifications email</label>
          </div>
        </div>
      </div>

      <!-- Types de documents requis -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium mb-4">Documents Requis</h3>
        <div class="space-y-3">
          <div *ngFor="let doc of requiredDocuments; let i = index" class="flex items-center justify-between">
            <div class="flex items-center">
              <input type="checkbox" [(ngModel)]="doc.required" [id]="'doc-' + i"
                     class="h-4 w-4 text-blue-600 border-gray-300 rounded">
              <label [for]="'doc-' + i" class="ml-2 text-sm text-gray-700">{{doc.label}}</label>
            </div>
            <div class="flex items-center space-x-2">
              <input type="number" [(ngModel)]="doc.maxSize" placeholder="Taille max (MB)"
                     class="w-20 px-2 py-1 text-xs border border-gray-300 rounded">
              <select [(ngModel)]="doc.format" class="px-2 py-1 text-xs border border-gray-300 rounded">
                <option value="PDF">PDF</option>
                <option value="IMAGE">Image</option>
                <option value="ALL">Tous</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Paramètres de sécurité -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium mb-4">Sécurité</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Durée de session (minutes)</label>
            <input type="number" [(ngModel)]="settings.sessionDuration"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tentatives de connexion max</label>
            <input type="number" [(ngModel)]="settings.maxLoginAttempts"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md">
          </div>
          
          <div class="flex items-center">
            <input type="checkbox" [(ngModel)]="settings.twoFactorAuth" id="twoFactor"
                   class="h-4 w-4 text-blue-600 border-gray-300 rounded">
            <label for="twoFactor" class="ml-2 text-sm text-gray-700">Authentification à deux facteurs</label>
          </div>
          
          <div class="flex items-center">
            <input type="checkbox" [(ngModel)]="settings.passwordComplexity" id="passwordComplexity"
                   class="h-4 w-4 text-blue-600 border-gray-300 rounded">
            <label for="passwordComplexity" class="ml-2 text-sm text-gray-700">Mot de passe complexe requis</label>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-4">
        <button (click)="resetSettings()" 
                class="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700">
          Réinitialiser
        </button>
        <button (click)="saveSettings()" 
                class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
          Sauvegarder
        </button>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  settings = {
    appName: 'Gestion Inscription',
    appDescription: 'Système de gestion des inscriptions',
    maintenanceMode: false,
    inscriptionDeadline: '',
    maxCandidats: 1000,
    autoValidation: false,
    emailNotifications: true,
    sessionDuration: 60,
    maxLoginAttempts: 3,
    twoFactorAuth: false,
    passwordComplexity: true
  };

  requiredDocuments = [
    { label: 'Certificat de naissance', required: true, maxSize: 5, format: 'PDF' },
    { label: 'Bulletin de notes', required: true, maxSize: 10, format: 'PDF' },
    { label: 'Relevé de notes', required: false, maxSize: 10, format: 'PDF' },
    { label: 'Photo d\'identité', required: true, maxSize: 2, format: 'IMAGE' },
    { label: 'Pièce d\'identité', required: true, maxSize: 5, format: 'ALL' }
  ];

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    // Simuler le chargement des paramètres
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 3);
    this.settings.inscriptionDeadline = deadline.toISOString().split('T')[0];
  }

  saveSettings() {
    // Simuler la sauvegarde
    console.log('Paramètres sauvegardés:', this.settings);
    console.log('Documents requis:', this.requiredDocuments);
    alert('Paramètres sauvegardés avec succès !');
  }

  resetSettings() {
    if (confirm('Réinitialiser tous les paramètres ?')) {
      this.loadSettings();
      alert('Paramètres réinitialisés !');
    }
  }
}