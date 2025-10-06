import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { LayoutComponent } from './shared/components/layout.component';
import { ToastContainerComponent } from './shared/components/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LayoutComponent, ToastContainerComponent],
  template: `
    <app-toast-container></app-toast-container>
    <div *ngIf="!isAuthPage(); else authTemplate">
      <app-layout></app-layout>
    </div>
    <ng-template #authTemplate>
      <router-outlet></router-outlet>
    </ng-template>
  `
})
export class AppComponent {
  title = 'Gestion Inscription';

  constructor(private authService: AuthService) {}

  isAuthPage(): boolean {
    const currentUrl = window.location.pathname;
    return currentUrl.includes('/auth/') || currentUrl === '/' || currentUrl === '/landing' || !this.authService.isAuthenticated();
  }
}
