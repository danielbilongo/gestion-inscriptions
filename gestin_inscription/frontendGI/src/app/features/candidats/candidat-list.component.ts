import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CandidatService } from '../../core/services/candidat.service';
import { Candidat } from '../../core/models/models';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-candidat-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <div class="flex justify-between items-center animate-slideDown">
        <h2 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Liste des Candidats</h2>
      </div>

      <div class="bg-white shadow-xl rounded-xl overflow-hidden animate-slideUp card-hover">
        <div class="px-6 py-6">
          <div class="mb-6">
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="filterCandidats()"
                   placeholder="Rechercher par nom, email..."
                   class="input-enhanced">
          </div>
          
          <div class="overflow-x-auto">
            <app-loading *ngIf="loading"></app-loading>
            <table *ngIf="!loading" class="table-enhanced min-w-full">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Date création</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let candidat of filteredCandidats">
                  <td>
                    <div class="text-sm font-medium text-gray-900">{{candidat.prenom}} {{candidat.nom}}</div>
                  </td>
                  <td>{{candidat.email}}</td>
                  <td>{{candidat.telephone}}</td>
                  <td>{{candidat.dateCreation | date:'short'}}</td>
                  <td class="space-x-2">
                    <button (click)="viewCandidat(candidat)" class="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-md transition-all duration-200">
                      <i class="fas fa-eye mr-1"></i>Voir
                    </button>
                    <button (click)="deleteCandidat(candidat.id!)" class="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded-md transition-all duration-200">
                      <i class="fas fa-trash mr-1"></i>Supprimer
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CandidatListComponent implements OnInit {
  candidats: Candidat[] = [];
  filteredCandidats: Candidat[] = [];
  searchTerm = '';
  loading = false;

  constructor(private candidatService: CandidatService) {}

  ngOnInit() {
    this.loadCandidats();
  }

  loadCandidats() {
    this.loading = true;
    this.candidatService.getAllCandidats().subscribe({
      next: (users) => {
        // Convert User objects to Candidat format
        this.candidats = users.map(user => ({
          id: user.id,
          nom: user.lastName || 'N/A',
          prenom: user.firstName || 'N/A',
          email: user.email || 'N/A',
          telephone: user.phoneNumber || 'N/A',
          dateCreation: user.createdAt || undefined
        }));
        this.filteredCandidats = this.candidats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des candidats:', error);
        this.loading = false;
        // Fallback to empty array on error
        this.candidats = [];
        this.filteredCandidats = [];
      }
    });
  }

  filterCandidats() {
    this.filteredCandidats = this.candidats.filter(c =>
      c.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      c.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  viewCandidat(candidat: Candidat) {
    console.log('Voir candidat:', candidat);
  }

  deleteCandidat(id: number) {
    if (confirm('Supprimer ce candidat ?')) {
      this.candidatService.deleteCandidat(id).subscribe({
        next: () => {
          // Mettre à jour localement la liste simulée
          this.candidats = this.candidats.filter(c => c.id !== id);
          this.filterCandidats();
        },
        error: (error) => console.error('Erreur:', error)
      });
    }
  }
}