import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as Array<string>;
    const currentUser = this.authService.currentUserValue;
    const userRole = this.authService.getUserRole();
    
    console.log('=== ROLE GUARD DEBUG ===');
    console.log('Required roles:', requiredRoles);
    console.log('User role (single):', userRole);
    console.log('User roles (all):', currentUser?.roles);
    console.log('Is authenticated:', this.authService.isAuthenticated());
    console.log('Route:', route.url);

    if (!this.authService.isAuthenticated()) {
      console.log('Not authenticated, redirecting to login');
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Vérifier si l'utilisateur a l'un des rôles requis
    const userRoles = currentUser?.roles?.map((r: string) => {
      const cleanRole = r.replace('ROLE_', '');
      return cleanRole;
    }) || [];
    
    const hasRequiredRole = requiredRoles && requiredRoles.some(role => userRoles.includes(role));
    console.log('Has required role:', hasRequiredRole);
    
    if (requiredRoles && !hasRequiredRole) {
      console.log('Access denied, redirecting based on user role:', userRole);
      // Rediriger vers la page appropriée selon le rôle
      switch (userRole) {
        case 'CANDIDATE':
          this.router.navigate(['/candidate/dashboard']);
          break;
        case 'AGENT':
          this.router.navigate(['/agent/dashboard']);
          break;
        case 'SUPER_ADMIN':
          this.router.navigate(['/admin/dashboard']);
          break;
        default:
          this.router.navigate(['/auth/login']);
      }
      return false;
    }

    console.log('Access granted');
    return true;
  }
}