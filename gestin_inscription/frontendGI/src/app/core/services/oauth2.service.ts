import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OAuth2Service {
  private readonly baseUrl = environment.apiUrl.replace('/api', ''); // Enlever /api pour OAuth2
  private readonly isDevelopment = !environment.production;

  constructor() { }

  /**
   * Redirige vers Google OAuth2 (vrai compte)
   */
  loginWithGoogle(): void {
    const url = `${this.baseUrl}/oauth2/authorization/google`; // Toujours utiliser le vrai OAuth2
    console.log('Redirecting to Google OAuth2:', url);
    window.location.href = url;
  }

  /**
   * Redirige vers Google OAuth2 Test (compte de test)
   */
  loginWithGoogleTest(): void {
    const url = `${environment.apiUrl}/oauth2/test/google`;
    console.log('Redirecting to Google OAuth2 Test:', url);
    window.location.href = url;
  }

  /**
   * Redirige vers Microsoft OAuth2 (vrai compte)
   */
  loginWithMicrosoft(): void {
    const url = `${this.baseUrl}/oauth2/authorization/microsoft`;
    console.log('Redirecting to Microsoft OAuth2:', url);
    window.location.href = url;
  }

  /**
   * Redirige vers Microsoft OAuth2 Test (compte de test)
   */
  loginWithMicrosoftTest(): void {
    const url = `${environment.apiUrl}/oauth2/test/microsoft`;
    console.log('Redirecting to Microsoft OAuth2 Test:', url);
    window.location.href = url;
  }

  /**
   * Extrait le token de l'URL après redirection OAuth2
   */
  extractTokenFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  }

  /**
   * Extrait tous les paramètres OAuth2 de l'URL
   */
  extractOAuth2ParamsFromUrl(): { token: string | null, user: string | null, name: string | null, role: string | null } {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      token: urlParams.get('token'),
      user: urlParams.get('user'),
      name: urlParams.get('name'),
      role: urlParams.get('role')
    };
  }

  /**
   * Nettoie l'URL après extraction du token
   */
  cleanUrl(): void {
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  /**
   * Vérifie si on est en mode développement
   */
  isDevelopmentMode(): boolean {
    return this.isDevelopment;
  }
}
