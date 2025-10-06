import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { RoleMapper } from '../models/models';

export interface AuthRequest {
  // Backend expects 'username' and 'password'
  username: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  roles: string[];
  nom: string;
  prenom: string;
  id: number;
  userId?: number;
  email?: string;
}

export interface User {
  id?: number;
  email: string;
  nom?: string;
  prenom?: string;
  roles?: string[];
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private readonly tokenKey = 'authToken';

  private router = inject(Router);

  constructor(private http: HttpClient) {
    const storedUser = this.getUserFromStorage();
    console.log('Debug - AuthService init - Stored user:', storedUser);
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
    
    // Initialiser le service de nettoyage des données utilisateur
    setTimeout(() => {
      import('../interceptors/user-data-cleanup.interceptor').then(({ UserDataCleanupService }) => {
        // Le service sera automatiquement initialisé via l'injection de dépendances
      });
    }, 0);
  }

  private getUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem(this.tokenKey);
      if (!stored) return null;
      const parsed: User = JSON.parse(stored);
      // Migration: certains anciens tokens stockaient email dans id (string)
      if (parsed && (parsed as any).id != null && !Number.isFinite((parsed as any).id)) {
        const token = (parsed as any).token as string | undefined;
        if (token) {
          try {
            const payload = this.decodeJWT(token);
            const numericIdCandidate = Number(payload?.userId ?? payload?.id);
            if (Number.isFinite(numericIdCandidate)) {
              (parsed as any).id = numericIdCandidate;
              localStorage.setItem(this.tokenKey, JSON.stringify(parsed));
            }
          } catch {
            // ignore
          }
        }
      }
      return parsed;
    } catch {
      localStorage.removeItem(this.tokenKey);
      return null;
    }
  }
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    const authRequest: AuthRequest = { username: email, password };
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, authRequest)
      .pipe(
        map(response => {
          console.log('Auth Response:', response);
          
          // Décoder le JWT pour extraire les vrais rôles
          const payload = this.decodeJWT(response.token);
          console.log('JWT Payload:', payload);
          
          const user: User = {
            id: payload.userId || payload.id || response.id,
            email: email,
            token: response.token,
            roles: response.roles || payload.roles || ['ROLE_AGENT'],
            nom: response.nom || payload.nom || 'Admin',
            prenom: response.prenom || payload.prenom || 'User'
          };
          localStorage.setItem(this.tokenKey, JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  loginWithRecaptcha(username: string, password: string, recaptchaToken: string): Observable<User> {
    const authRequest = { username, password, recaptchaToken };
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, authRequest)
      .pipe(
        map(response => {
          const payload = this.decodeJWT(response.token);
          console.log('JWT Payload:', payload);
          
          const user: User = {
            id: payload.userId || payload.id,
            email: payload.sub || payload.email,
            token: response.token,
            roles: payload.roles || ['ROLE_AGENT'],
            nom: payload.nom || 'Admin',
            prenom: payload.prenom || 'User'
          };
          localStorage.setItem(this.tokenKey, JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          console.error('Login with reCAPTCHA error:', error);
          return throwError(() => error);
        })
      );
  }

  private decodeJWT(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      console.log('JWT Payload:', decoded); // Debug
      return decoded;
    } catch (error) {
      console.error('Erreur décodage JWT:', error);
      return {};
    }
  }

  // Inscription des candidats - endpoint maintenant implémenté
  register(userData: RegisterRequest): Observable<User> {
    console.log('Attempting registration with data:', userData);
    console.log('API URL:', `${environment.apiUrl}/auth/register`);
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData)
      .pipe(
        map(response => {
          console.log('Registration successful:', response);
          
          // Si un token est retourné, créer l'utilisateur et le connecter
          if (response.token) {
            const user: User = {
              id: response.userId || response.id,
              email: response.email || userData.email,
              token: response.token,
              roles: response.roles || ['ROLE_CANDIDATE'],
              nom: response.nom || userData.nom,
              prenom: response.prenom || userData.prenom
            };
            
            localStorage.setItem(this.tokenKey, JSON.stringify(user));
            this.currentUserSubject.next(user);
            return user;
          }
          
          // Fallback si pas de token (ancien comportement)
          return response as any;
        }),
        catchError(error => {
          console.error('Register API error:', error);
          console.log('Error details - Status:', error.status, 'Message:', error.message);
          console.log('Error response body:', error.error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    // Nettoyer les données utilisateur avant la déconnexion
    try {
      import('../interceptors/user-data-cleanup.interceptor').then(({ UserDataCleanupService }) => {
        // Le nettoyage sera automatique via le changement d'utilisateur
      });
    } catch (error) {
      console.warn('Erreur lors du nettoyage des données:', error);
    }
    
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem(this.tokenKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  isAuthenticated(): boolean {
    return !!(this.currentUserValue?.token);
  }

  getToken(): string | null {
    const token = this.currentUserValue?.token || null;
    console.log('Debug - getToken called, returning:', token ? 'Token exists' : 'No token');
    
    if (token) {
      // Vérifier si le token est expiré
      try {
        const payload = this.decodeJWT(token);
        const currentTime = Math.floor(Date.now() / 1000);
        console.log('Debug - Token payload:', payload);
        console.log('Debug - Current time:', currentTime, 'Token exp:', payload.exp);
        
        if (payload.exp && payload.exp < currentTime) {
          console.log('Debug - Token is expired, logging out');
          this.logout();
          return null;
        }
        console.log('Debug - Token is valid, expires at:', new Date(payload.exp * 1000));
      } catch (error) {
        console.log('Debug - Error decoding token:', error);
        this.logout();
        return null;
      }
    }
    
    return token;
  }

  setToken(token: string, userInfo?: { email?: string, name?: string, role?: string }): void {
    try {
      // Décoder le JWT pour extraire les informations utilisateur
      const payload = this.decodeJWT(token);
      
      // Extraire le rôle du JWT (format: ["ROLE_CANDIDATE"])
      let roles = ['ROLE_CANDIDATE']; // Défaut pour OAuth2
      if (payload.authorities && Array.isArray(payload.authorities)) {
        roles = payload.authorities.map((auth: any) => auth.authority || auth);
      } else if (userInfo?.role) {
        roles = [`ROLE_${userInfo.role}`];
      }
      
      // Extraire le nom ou utiliser l'email
      let nom = '', prenom = '';
      if (userInfo?.name) {
        const nameParts = userInfo.name.split(' ');
        prenom = nameParts[0] || '';
        nom = nameParts.slice(1).join(' ') || '';
      }
      
      // Si pas de nom, utiliser l'email
      if (!prenom && !nom && userInfo?.email) {
        prenom = userInfo.email;
        nom = '';
      }
      
      const user: User = {
        id: payload.userId || payload.id,
        email: userInfo?.email || payload.sub || payload.email,
        token: token,
        roles: roles,
        nom: nom,
        prenom: prenom
      };
      
      console.log('OAuth2 user created:', user);
      localStorage.setItem(this.tokenKey, JSON.stringify(user));
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Erreur lors du stockage du token OAuth2:', error);
    }
  }

  hasRole(role: string): boolean {
    const userRoles = this.currentUserValue?.roles || [];
    // Vérifier avec et sans préfixe ROLE_
    return userRoles.includes(role) || userRoles.includes(`ROLE_${role}`);
  }

  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.currentUserValue?.roles;
    if (!userRoles) return false;
    
    return roles.some(role => 
      userRoles.includes(role) || userRoles.includes(`ROLE_${role}`)
    );
  }

  isAgent(): boolean {
    return this.hasRole('AGENT');
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN') || this.hasRole('SUPER_ADMIN');
  }

  isCandidate(): boolean {
    return this.hasRole('CANDIDATE') || this.hasRole('CANDIDAT');
  }

  getUserRole(): string {
    const user = this.currentUserValue;
    if (user?.roles && user.roles.length > 0) {
      return user.roles[0].replace('ROLE_', '');
    }
    return 'CANDIDATE';
  }

  getCurrentUser(): User | null {
    return this.currentUserValue;
  }
}