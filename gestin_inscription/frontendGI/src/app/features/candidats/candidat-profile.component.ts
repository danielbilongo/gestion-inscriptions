import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidatService } from '../../core/services/candidat.service';
import { AuthService } from '../../core/services/auth.service';
import { Candidat } from '../../core/models/models';

@Component({
  selector: 'app-candidat-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="bg-white rounded-lg shadow-md p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Mon Profil</h2>
        
        <form (ngSubmit)="updateProfile()" #profileForm="ngForm" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input 
                type="text" 
                [(ngModel)]="candidat.nom" 
                name="nom"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
              <input 
                type="text" 
                [(ngModel)]="candidat.prenom" 
                name="prenom"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                [(ngModel)]="candidat.email" 
                name="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input 
                type="tel" 
                [(ngModel)]="candidat.telephone" 
                name="telephone"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+237 6XX XXX XXX">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
              <input 
                type="date" 
                [(ngModel)]="candidat.dateNaissance" 
                name="dateNaissance"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Lieu de naissance</label>
              <input 
                type="text" 
                [(ngModel)]="candidat.lieuNaissance" 
                name="lieuNaissance"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
            <textarea 
              [(ngModel)]="candidat.adresse" 
              name="adresse"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Type de pièce d'identité</label>
              <select 
                [(ngModel)]="candidat.pieceIdentite" 
                name="pieceIdentite"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sélectionner...</option>
                <option value="CNI">Carte Nationale d'Identité</option>
                <option value="PASSEPORT">Passeport</option>
                <option value="PERMIS">Permis de conduire</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Numéro de pièce d'identité</label>
              <input 
                type="text" 
                [(ngModel)]="candidat.numeroIdentite" 
                name="numeroIdentite"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          
          <div class="flex justify-end space-x-4">
            <button 
              type="button" 
              (click)="loadProfile()"
              class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Annuler
            </button>
            <button 
              type="submit" 
              [disabled]="!profileForm.form.valid || isLoading"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {{isLoading ? 'Enregistrement...' : 'Enregistrer'}}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CandidatProfileComponent implements OnInit {
  candidat: Candidat = {
    nom: '',
    prenom: '',
    email: ''
  };
  isLoading = false;

  constructor(
    private candidatService: CandidatService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const currentUser = this.authService.currentUserValue;
    if (currentUser?.id) {
      this.candidatService.getCandidatById(currentUser.id).subscribe({
        next: (candidat) => this.candidat = candidat,
        error: (error) => {
          console.error('Erreur chargement profil:', error);
          alert('Erreur lors du chargement du profil');
        }
      });
    }
  }

  updateProfile() {
    if (this.candidat.id) {
      this.isLoading = true;
      this.candidatService.updateCandidat(this.candidat.id, this.candidat).subscribe({
        next: (candidat) => {
          this.candidat = candidat;
          this.isLoading = false;
          alert('Profil mis à jour avec succès!');
        },
        error: (error) => {
          console.error('Erreur mise à jour profil:', error);
          this.isLoading = false;
          alert('Erreur lors de la mise à jour du profil');
        }
      });
    }
  }
}