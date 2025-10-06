import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentService } from '../../core/services/agent.service';
import { Agent } from '../../core/models/models';

@Component({
  selector: 'app-agent-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">Gestion des Agents</h2>

      </div>



      <div *ngIf="showEditForm" class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium mb-4">Modifier l'Agent</h3>
        <form (ngSubmit)="updateAgent()" #editForm="ngForm" class="grid grid-cols-2 gap-4" novalidate>
          <input type="text" [(ngModel)]="editingAgent.nom" name="nom" placeholder="Nom" required
                 class="px-3 py-2 border border-gray-300 rounded-md">
          <input type="text" [(ngModel)]="editingAgent.prenom" name="prenom" placeholder="Prénom" required
                 class="px-3 py-2 border border-gray-300 rounded-md">
          <input type="email" [(ngModel)]="editingAgent.email" name="email" placeholder="Email" required
                 class="px-3 py-2 border border-gray-300 rounded-md">
          <input type="tel" [(ngModel)]="editingAgent.telephone" name="telephone" placeholder="Téléphone"
                 class="px-3 py-2 border border-gray-300 rounded-md">
          <input type="text" [(ngModel)]="editingAgent.fonction" name="fonction" placeholder="Fonction"
                 class="px-3 py-2 border border-gray-300 rounded-md">
          <input type="password" [(ngModel)]="editingAgent.password" name="password" placeholder="Nouveau mot de passe (optionnel)"
                 class="px-3 py-2 border border-gray-300 rounded-md">
          <div class="flex space-x-2">
            <button type="button" (click)="updateAgent()"
                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Modifier
            </button>
            <button type="button" (click)="cancelEdit()"
                    class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
              Annuler
            </button>
          </div>
        </form>
      </div>

      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fonction</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let agent of agents">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{agent.firstName || agent.prenom || 'N/A'}} {{agent.lastName || agent.nom || 'N/A'}}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{agent.email}}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{agent.fonction || 'Agent'}}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button (click)="editAgent(agent)" class="text-blue-600 hover:text-blue-900">Modifier</button>
                <button (click)="deleteAgent(agent.id!)" class="text-red-600 hover:text-red-900">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AgentManagementComponent implements OnInit {
  agents: Agent[] = [];
  showEditForm = false;
  editingAgent: Agent = { nom: '', prenom: '', email: '', password: '' };

  constructor(private agentService: AgentService) {}

  ngOnInit() {
    this.loadAgents();
  }

  loadAgents() {
    this.agentService.getAllAgents().subscribe({
      next: (agents) => {
        console.log('Agents chargés:', agents);
        this.agents = agents;
      },
      error: (error) => {
        console.error('Erreur chargement agents:', error);
        // Pas de données de démonstration
        this.agents = [];
      }
    });
  }



  editAgent(agent: Agent) {
    this.editingAgent = { ...agent };
    this.showEditForm = true;
  }

  updateAgent() {
    if (!this.editingAgent.nom || !this.editingAgent.prenom || !this.editingAgent.email) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }



    if (!this.editingAgent.id) {
      alert('ID de l\'agent manquant');
      return;
    }

    this.agentService.updateAgent(this.editingAgent.id, this.editingAgent).subscribe({
      next: (agent) => {
        console.log('Agent modifié:', agent);
        this.loadAgents();
        this.cancelEdit();
        alert('Agent modifié avec succès!');
      },
      error: (error) => {
        console.error('Erreur modification agent:', error);
        alert('Erreur lors de la modification de l\'agent');
      }
    });
  }

  cancelEdit() {
    this.showEditForm = false;
    this.editingAgent = { nom: '', prenom: '', email: '', password: '' };
  }

  deleteAgent(id: number) {
    if (confirm('Supprimer cet agent ?')) {
      this.agentService.deleteAgent(id).subscribe({
        next: () => this.loadAgents(),
        error: (error) => console.error('Erreur:', error)
      });
    }
  }
}