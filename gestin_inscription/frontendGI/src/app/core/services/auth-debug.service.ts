import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthDebugService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Vérifier l'état de l'authentification
   */
  checkAuthStatus(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/debug/auth-status`);
  }

  /**
   * Tester l'endpoint de soumission avec debug
   */
  testSubmitEndpoint(): Observable<any> {
    const testData = {
      personalInfo: {
        lastName: 'Test',
        firstNames: ['Test'],
        gender: 'M',
        birthDate: '1990-01-01',
        nationality: 'Cameroun',
        idType: 'CNI'
      },
      contactInfo: {
        email: 'test@example.com',
        emailConfirm: 'test@example.com',
        countryCode: '+237',
        phone: '123456789',
        address: {
          street: 'Test Street',
          city: 'Test City',
          postalCode: '12345',
          country: 'Cameroun'
        },
        emergencyContact: {
          name: 'Test Contact',
          relationship: 'Parent',
          phone: '987654321'
        }
      },
      academicHistory: {
        lastInstitution: 'Test University',
        specialization: 'Test Specialization',
        startDate: '2020-01-01',
        endDate: '2024-01-01',
        educationLevel: 'Bachelor'
      }
    };

    return this.http.post(`${environment.apiUrl}/applications/submit`, { applicationData: testData });
  }

  /**
   * Créer un utilisateur de test si nécessaire
   */
  createTestUser(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/debug/create-test-user`, null, {
      params: { email }
    });
  }

  /**
   * Diagnostiquer et réparer automatiquement les problèmes d'authentification
   */
  diagnoseAndFix(): Observable<any> {
    return this.checkAuthStatus().pipe(
      switchMap((authStatus: any) => {
        if (authStatus.jwtValid && authStatus.jwtUsername && authStatus.userExists === false) {
          console.log('Utilisateur manquant détecté, création automatique...');
          return this.createTestUser(authStatus.jwtUsername);
        }
        return of(authStatus);
      })
    );
  }

  /**
   * Afficher les informations de debug dans la console
   */
  logDebugInfo(): void {
    const user = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    
    console.log('=== AUTH DEBUG INFO ===');
    console.log('User:', user);
    console.log('Token exists:', !!token);
    console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
    console.log('Is authenticated:', this.authService.isAuthenticated());
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('JWT Payload:', payload);
        console.log('Token expires at:', new Date(payload.exp * 1000));
        console.log('Current time:', new Date());
        console.log('Token is expired:', payload.exp < Math.floor(Date.now() / 1000));
      } catch (error) {
        console.log('Error decoding token:', error);
      }
    }
    
    console.log('LocalStorage authToken:', localStorage.getItem('authToken'));
    console.log('======================');
  }
}