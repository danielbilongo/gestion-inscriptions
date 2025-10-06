import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  
  console.log('Debug - Auth Interceptor - URL:', req.url);
  console.log('Debug - Auth Interceptor - Token exists:', !!token);
  console.log('Debug - Auth Interceptor - Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
  
  let authReq = req;
  // Attacher le token à TOUTES les requêtes si disponible (pour debug)
  if (token) {
    authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    console.log('Debug - Auth Interceptor - Authorization header added');
  } else {
    console.log('Debug - Auth Interceptor - No token, request sent without Authorization header');
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('Debug - Auth Interceptor - HTTP Error:', error.status, error.message);
      console.log('Debug - Auth Interceptor - Error details:', error.error);
      
      // Gestion spéciale des erreurs 401 pour les endpoints critiques
      if (error.status === 401) {
        const criticalEndpoints = ['/api/applications/submit', '/api/users/me'];
        const isCriticalEndpoint = criticalEndpoints.some(endpoint => req.url.includes(endpoint));
        
        if (isCriticalEndpoint) {
          console.log('Debug - Auth Interceptor - 401 on critical endpoint, checking token...');
          
          // Vérifier si le token existe et est valide
          const currentToken = authService.getToken();
          if (!currentToken) {
            console.log('Debug - Auth Interceptor - No token found, redirecting to login');
            authService.logout();
            return throwError(() => error);
          }
          
          // Vérifier si le token est expiré
          try {
            const payload = JSON.parse(atob(currentToken.split('.')[1]));
            const isExpired = payload.exp < Math.floor(Date.now() / 1000);
            if (isExpired) {
              console.log('Debug - Auth Interceptor - Token expired, redirecting to login');
              authService.logout();
              return throwError(() => error);
            }
          } catch (tokenError) {
            console.log('Debug - Auth Interceptor - Invalid token format, redirecting to login');
            authService.logout();
            return throwError(() => error);
          }
          
          console.log('Debug - Auth Interceptor - Token seems valid but 401 received. Server issue?');
        }
      }
      
      return throwError(() => error);
    })
  );
};