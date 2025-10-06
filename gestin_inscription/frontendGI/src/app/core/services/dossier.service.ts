import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Dossier, DossierStatus } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DossierService {
  constructor(private api: ApiService, private authService: AuthService, private http: HttpClient) {}

  createDossier(candidatId: number, dossier: Dossier): Observable<Dossier> {
    return this.api.post<Dossier>(`/applications/submit`, dossier as any);
  }

  getDossierById(id: number): Observable<Dossier> {
    return this.api.get<Dossier>(`/applications/${id}`);
  }

  getAllDossiers(): Observable<Dossier[]> {
    const currentUser = this.authService.currentUserValue;
    console.log('Debug - Current user:', currentUser);
    console.log('Debug - User roles:', currentUser?.roles);
    console.log('Debug - Has SUPER_ADMIN role:', this.authService.hasRole('ROLE_SUPER_ADMIN'));
    console.log('Debug - Has CANDIDAT role:', this.authService.hasRole('ROLE_CANDIDAT'));
    console.log('Debug - Token exists:', !!this.authService.getToken());
    
    if (this.authService.isAgent() || this.authService.isAdmin()) {
      console.log('Debug - Using /applications/all endpoint');
      return this.api.get<any>(`/applications/all`).pipe(
        map(response => {
          console.log('Debug - API response:', response);
          return this.mapApplicationsToDossiers(response);
        }),
        catchError(error => {
          console.error('Error fetching all applications:', error);
          return of([]);
        })
      );
    } else {
      console.log('Debug - Using /applications/my-applications endpoint');
      return this.api.get<any>(`/applications/my-applications`).pipe(
        map(response => {
          console.log('Debug - API response:', response);
          return this.mapApplicationsToDossiers(response);
        }),
        catchError(error => {
          console.error('Error fetching my applications:', error);
          return of([]);
        })
      );
    }
  }

  private mapApplicationsToDossiers(response: any): Dossier[] {
    console.log('=== MAPPING DEBUG ===');
    console.log('Response:', response);
    
    const applications = response?.applications || response;
    
    if (!Array.isArray(applications)) {
      console.warn('Applications is not an array:', applications);
      return [];
    }
    
    console.log('Applications array:', applications);

    return applications.map(app => {
      console.log('Mapping application:', app);
      
      const dossier = {
        id: app.id,
        candidat: app.candidat,
        status: this.mapBackendStatusToFrontend(app.status),
        dateCreation: app.dateCreation,
        documents: app.documents || []
      };
      
      console.log('Mapped dossier:', dossier);
      return dossier;
    });
  }

  private mapBackendStatusToFrontend(backendStatus: string): DossierStatus {
    switch (backendStatus?.toUpperCase()) {
      case 'UNDER_REVIEW':
      case 'PENDING':
        return DossierStatus.EN_ATTENTE;
      case 'IN_PROGRESS':
        return DossierStatus.EN_COURS;
      case 'APPROVED':
        return DossierStatus.VALIDE;
      case 'REJECTED':
        return DossierStatus.REJETE;
      default:
        return DossierStatus.EN_ATTENTE;
    }
  }

  deleteDossier(id: number): Observable<void> {
    return this.api.delete<void>(`/applications/${id}`);
  }

  updateDossierStatus(id: number, status: DossierStatus): Observable<Dossier> {
    const decision = status as unknown as string;
    return this.api.put<Dossier>(`/applications/review/${id}?decision=${decision}`);
  }

  downloadRegistrationForm(applicationId: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/applications/${applicationId}/registration-form`, {
      responseType: 'blob'
    });
  }
}