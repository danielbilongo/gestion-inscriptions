import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-redirect',
  standalone: true,
  template: '<div>Redirection...</div>'
})
export class DashboardRedirectComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const userRole = this.authService.getUserRole();
    
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
  }
}