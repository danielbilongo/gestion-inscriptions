import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Candidat, UserResponseDTO } from '../models/models';
@Injectable({
  providedIn: 'root'
})
export class CandidatService {
  // Backend: UserController is exposed under /api/users
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllCandidats(): Observable<UserResponseDTO[]> {
    // GET /api/users/all (requires SUPER_ADMIN)
    return this.http.get<UserResponseDTO[]>(`${this.apiUrl}/all`);
  }

  updateCandidat(id: number, candidat: Candidat): Observable<Candidat> {
    // PUT /api/users/{id}
    return this.http.put<Candidat>(`${this.apiUrl}/${id}`, candidat);
  }

  deleteCandidat(id: number): Observable<void> {
    // DELETE /api/users/{id} (requires SUPER_ADMIN)
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCandidatById(id: number): Observable<Candidat> {
    // GET /api/users/{id}
    return this.http.get<Candidat>(`${this.apiUrl}/${id}`);
  }

  // GET /api/users/me (profil du user courant - rôle CANDIDATE)
  getMe(): Observable<Candidat> {
    return this.http.get<Candidat>(`${this.apiUrl}/me`);
  }

  // GET /api/users/username/{username}
  getByUsername(username: string): Observable<Candidat> {
    return this.http.get<Candidat>(`${this.apiUrl}/username/${encodeURIComponent(username)}`);
  }
}