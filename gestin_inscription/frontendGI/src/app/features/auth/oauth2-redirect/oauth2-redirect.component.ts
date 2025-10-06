import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OAuth2Service } from '../../../core/services/oauth2.service';

@Component({
  selector: 'app-oauth2-redirect',
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gray-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Connexion en cours...</p>
      </div>
    </div>
  `,
  standalone: true
})
export class OAuth2RedirectComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService,
    private oauth2Service: OAuth2Service
  ) {}

  ngOnInit(): void {
    console.log('OAuth2 redirect component initialized');
    console.log('Current URL:', window.location.href);
    
    // Extraire tous les paramètres OAuth2 de l'URL
    const params = this.oauth2Service.extractOAuth2ParamsFromUrl();
    console.log('Extracted OAuth2 params:', params);
    
    if (params.token) {
      try {
        // Stocker le token avec les informations utilisateur
        this.authService.setToken(params.token, {
          email: params.user || undefined,
          name: params.name || undefined,
          role: params.role || undefined
        });
        console.log('Token stored successfully with user info');
        
        // Nettoyer l'URL
        this.oauth2Service.cleanUrl();
        
        // Rediriger vers le dashboard
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      } catch (error) {
        console.error('Error processing OAuth2 token:', error);
        this.router.navigate(['/auth/login'], { 
          queryParams: { error: 'oauth2_processing_failed' } 
        });
      }
    } else {
      console.log('No token found, redirecting to login');
      // Erreur - rediriger vers login
      this.router.navigate(['/auth/login'], { 
        queryParams: { error: 'oauth2_failed' } 
      });
    }
  }
}
