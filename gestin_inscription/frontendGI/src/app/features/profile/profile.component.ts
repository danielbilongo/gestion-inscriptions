import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="bg-gradient-to-r from-primary-600 to-accent-600 px-8 py-12 text-white relative">
          <div class="flex items-center space-x-6">
            <!-- Photo de profil -->
            <div class="relative">
              <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img *ngIf="profilePhoto" [src]="profilePhoto" alt="Photo de profil" class="w-full h-full object-cover">
                <div *ngIf="!profilePhoto" class="w-full h-full bg-white/20 flex items-center justify-center">
                  <i class="fas fa-user text-4xl text-white/70"></i>
                </div>
              </div>
              <button (click)="triggerFileInput()" 
                      class="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-primary-600 hover:bg-gray-50 transition-colors">
                <i class="fas fa-camera"></i>
              </button>
              <input #fileInput type="file" accept="image/*" (change)="onFileSelected($event)" class="hidden">
            </div>
            
            <!-- Informations -->
            <div>
              <h1 class="text-3xl font-bold">{{currentUser?.prenom}} {{currentUser?.nom}}</h1>
              <p class="text-xl opacity-90">{{getUserRoleLabel()}}</p>
              <p class="text-sm opacity-75 mt-2">{{currentUser?.email}}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulaire de profil -->
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-gray-900">Informations personnelles</h2>
          <button *ngIf="!isEditing" (click)="startEditing()" class="btn-primary">
            <i class="fas fa-edit mr-2"></i>Modifier
          </button>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
              <input type="text" formControlName="prenom" [readonly]="!isEditing"
                     class="input-enhanced" [class.bg-gray-50]="!isEditing">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input type="text" formControlName="nom" [readonly]="!isEditing"
                     class="input-enhanced" [class.bg-gray-50]="!isEditing">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" formControlName="email" [readonly]="!isEditing"
                     class="input-enhanced" [class.bg-gray-50]="!isEditing">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input type="tel" formControlName="telephone" [readonly]="!isEditing"
                     class="input-enhanced" [class.bg-gray-50]="!isEditing"
                     placeholder="+237 6XX XXX XXX">
            </div>
          </div>

          <div *ngIf="isEditing" class="flex space-x-4 pt-6">
            <button type="submit" [disabled]="profileForm.invalid || saving" class="btn-primary">
              <i class="fas fa-save mr-2"></i>
              {{saving ? 'Enregistrement...' : 'Enregistrer'}}
            </button>
            <button type="button" (click)="cancelEditing()" class="btn-secondary">
              <i class="fas fa-times mr-2"></i>Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  isEditing = false;
  saving = false;
  profilePhoto: string | null = null;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['']
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    this.loadProfile();
  }

  loadProfile() {
    if (this.currentUser) {
      this.profileForm.patchValue({
        prenom: this.currentUser.prenom,
        nom: this.currentUser.nom,
        email: this.currentUser.email,
        telephone: ''
      });
    }
  }

  startEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
    this.loadProfile();
  }

  saveProfile() {
    if (this.profileForm.valid) {
      this.saving = true;
      
      setTimeout(() => {
        this.saving = false;
        this.isEditing = false;
        alert('Profil mis à jour avec succès!');
      }, 1000);
    }
  }

  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePhoto = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  getUserRoleLabel(): string {
    const roles = this.currentUser?.roles || [];
    if (roles.includes('ADMIN')) return 'Administrateur';
    if (roles.includes('AGENT')) return 'Agent';
    if (roles.includes('CANDIDAT')) return 'Candidat';
    return 'Utilisateur';
  }
}