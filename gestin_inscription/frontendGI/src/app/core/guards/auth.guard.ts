import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Si l'utilisateur essaie d'accéder au formulaire d'inscription sans être connecté
    if (state.url === '/inscription') {
      this.router.navigate(['/auth/register'], { 
        queryParams: { returnUrl: state.url, message: 'Veuillez créer un compte pour accéder au formulaire d\'inscription' } 
      }).catch(console.error);
    } else {
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url } 
      }).catch(console.error);
    }
    return false;
  }
}