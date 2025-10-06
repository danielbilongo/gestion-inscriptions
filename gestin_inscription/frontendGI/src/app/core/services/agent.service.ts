import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Agent } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  // Backend: AdministratorController exposes POST /api/admin/profile/agent
  private adminProfileUrl = `${environment.apiUrl}/admin/profile`;

  constructor(private http: HttpClient) {}

  getAllAgents(): Observable<Agent[]> {
    // Utiliser le nouvel endpoint dédié aux agents
    return this.http.get<Agent[]>(`${environment.apiUrl}/agents/all`);
  }



  updateAgent(id: number, agent: Agent): Observable<Agent> {
    // Mapper les données frontend vers backend
    const agentData = {
      username: agent.firstName && agent.lastName ? 
        `${agent.firstName.toLowerCase()}.${agent.lastName.toLowerCase()}` : 
        `${(agent.prenom || '').toLowerCase()}.${(agent.nom || '').toLowerCase()}`,
      email: agent.email || '',
      firstName: agent.firstName || agent.prenom || '',
      lastName: agent.lastName || agent.nom || ''
    };
    
    // Ajouter le mot de passe seulement s'il est fourni
    if (agent.password && agent.password.trim() !== '') {
      (agentData as any).password = agent.password;
    }
    
    return this.http.put<Agent>(`${environment.apiUrl}/agents/${id}`, agentData);
  }

  deleteAgent(id: number): Observable<void> {
    // Utiliser le nouvel endpoint de suppression d'agent
    return this.http.delete<void>(`${environment.apiUrl}/agents/${id}`);
  }
}