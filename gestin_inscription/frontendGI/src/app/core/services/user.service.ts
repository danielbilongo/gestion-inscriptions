import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  nationality?: string;
  dateOfBirth?: string;
  gender?: string;
  userIdNum?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`);
  }

  /**
   * Get current user profile data formatted for registration form
   */
  getCurrentUserFormData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me/form-data`);
  }

  /**
   * Get OAuth2 user form data
   */
  getOAuth2UserFormData(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/oauth2-users/me/form-data`);
  }

  /**
   * Update current user profile
   */
  updateCurrentUser(userData: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/me`, userData);
  }
}
