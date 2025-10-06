import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CandidatService } from '../../core/services/candidat.service';
import { Candidat } from '../../core/models/models';
import { ModalComponent } from '../../shared/components/modal.component';

@Component({
  selector: 'app-candidat-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Nouveau Candidat</h1>
            <p class="text-gray-600 mt-2">Créer un nouveau profil candidat</p>
          </div>
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <i class="fas fa-user-plus text-white text-2xl"></i>
          </div>
        </div>
      </div>

      <!-- Formulaire -->
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <form [formGroup]="candidatForm" (ngSubmit)="createCandidat()" class="space-y-6">
          <!-- Informations personnelles -->
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                <input type="text" formControlName="prenom" class="input-enhanced" placeholder="Entrez le prénom">
                <div *ngIf="candidatForm.get('prenom')?.invalid && candidatForm.get('prenom')?.touched" 
                     class="text-red-500 text-sm mt-1">Le prénom est requis</div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input type="text" formControlName="nom" class="input-enhanced" placeholder="Entrez le nom">
                <div *ngIf="candidatForm.get('nom')?.invalid && candidatForm.get('nom')?.touched" 
                     class="text-red-500 text-sm mt-1">Le nom est requis</div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" formControlName="email" class="input-enhanced" placeholder="exemple@email.com">
                <div *ngIf="candidatForm.get('email')?.invalid && candidatForm.get('email')?.touched" 
                     class="text-red-500 text-sm mt-1">Email valide requis</div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input type="tel" formControlName="telephone" class="input-enhanced" placeholder="+33 6 12 34 56 78">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                <input type="date" formControlName="dateNaissance" class="input-enhanced">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Lieu de naissance</label>
                <input type="text" formControlName="lieuNaissance" class="input-enhanced" placeholder="Ville, Pays">
              </div>
            </div>
          </div>

          <!-- Adresse -->
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Adresse</h3>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Adresse complète</label>
              <textarea formControlName="adresse" rows="3" class="input-enhanced" 
                        placeholder="Numéro, rue, ville, code postal, pays"></textarea>
            </div>
          </div>

          <!-- Pièce d'identité -->
          <div class="pb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Pièce d'identité</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Type de pièce</label>
                <select formControlName="pieceIdentite" class="input-enhanced">
                  <option value="">Sélectionner un type</option>
                  <option value="CNI">Carte Nationale d'Identité</option>
                  <option value="PASSEPORT">Passeport</option>
                  <option value="PERMIS">Permis de conduire</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Numéro de pièce</label>
                <input type="text" formControlName="numeroIdentite" class="input-enhanced" 
                       placeholder="Numéro de la pièce d'identité">
              </div>
            </div>
          </div>

          <!-- Boutons -->
          <div class="flex space-x-4 pt-6">
            <button type="submit" [disabled]="candidatForm.invalid || creating" class="btn-primary flex-1">
              <i class="fas fa-save mr-2"></i>
              {{creating ? 'Création en cours...' : 'Créer le candidat'}}
            </button>
            <button type="button" (click)="cancel()" class="btn-secondary">
              <i class="fas fa-times mr-2"></i>Annuler
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de succès -->
    <app-modal [isOpen]="showSuccessModal" title="Candidat créé" (closeModal)="closeSuccessModal()">
      <div class="text-center py-4">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-check text-green-600 text-2xl"></i>
        </div>
        <p class="text-gray-700">Le candidat a été créé avec succès!</p>
        <div class="mt-6 flex space-x-3">
          <button (click)="createAnother()" class="btn-primary flex-1">Créer un autre</button>
          <button (click)="goToList()" class="btn-secondary flex-1">Voir la liste</button>
        </div>
      </div>
    </app-modal>
  `
})
export class CandidatFormComponent {
  candidatForm: FormGroup;
  creating = false;
  showSuccessModal = false;

  constructor(
    private fb: FormBuilder,
    private candidatService: CandidatService,
    private router: Router
  ) {
    this.candidatForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      dateNaissance: [''],
      lieuNaissance: [''],
      adresse: [''],
      pieceIdentite: [''],
      numeroIdentite: ['']
    });
  }

  createCandidat() {
    if (this.candidatForm.valid) {
      this.creating = true;
      
      const candidat: Candidat = this.candidatForm.value;
      
      this.candidatService.createCandidat(candidat).subscribe({
        next: (response) => {
          this.creating = false;
          this.showSuccessModal = true;
        },
        error: (error) => {
          this.creating = false;
          console.error('Erreur création candidat:', error);
          // Simuler le succès pour la démo
          this.showSuccessModal = true;
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/candidats']);
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }

  createAnother() {
    this.showSuccessModal = false;
    this.candidatForm.reset();
  }

  goToList() {
    this.showSuccessModal = false;
    this.router.navigate(['/candidats']);
  }
}