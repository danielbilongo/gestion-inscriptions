import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { 
    path: 'oauth2/redirect', 
    loadComponent: () => import('./features/auth/oauth2-redirect/oauth2-redirect.component').then(m => m.OAuth2RedirectComponent)
  },

  // CANDIDATE ROUTES
  { 
    path: 'candidate/dashboard', 
    component: DashboardComponent, 
    canActivate: [RoleGuard],
    data: { roles: ['CANDIDATE'] }
  },
  { 
    path: 'inscription', 
    loadComponent: () => import('./features/registration/registration-wizard.component').then(m => m.RegistrationWizardComponent),
    canActivate: [RoleGuard],
    data: { roles: ['CANDIDATE'] }
  },
  { 
    path: 'candidate/dossiers', 
    loadChildren: () => import('./features/dossiers/dossiers.routes').then(m => m.routes),
    canActivate: [RoleGuard],
    data: { roles: ['CANDIDATE'] }
  },
  { 
    path: 'candidate/notifications', 
    loadComponent: () => import('./features/notifications/notification-center.component').then(m => m.NotificationCenterComponent),
    canActivate: [RoleGuard],
    data: { roles: ['CANDIDATE'] }
  },

  // AGENT ROUTES
  { 
    path: 'agent/dashboard', 
    component: DashboardComponent, 
    canActivate: [RoleGuard],
    data: { roles: ['AGENT'] }
  },
  { 
    path: 'agent/dossiers', 
    loadChildren: () => import('./features/dossiers/dossiers.routes').then(m => m.routes),
    canActivate: [RoleGuard],
    data: { roles: ['AGENT', 'SUPER_ADMIN'] }
  },
  { 
    path: 'agent/documents', 
    loadComponent: () => import('./features/documents/document-management.component').then(m => m.DocumentManagementComponent),
    canActivate: [RoleGuard],
    data: { roles: ['AGENT'] }
  },
  { 
    path: 'agent/reports', 
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [RoleGuard],
    data: { roles: ['AGENT'] }
  },

  // SUPER_ADMIN ROUTES
  { 
    path: 'admin/dashboard', 
    component: DashboardComponent, 
    canActivate: [RoleGuard],
    data: { roles: ['SUPER_ADMIN'] }
  },
  { 
    path: 'admin/agents', 
    loadComponent: () => import('./features/agents/agent-management.component').then(m => m.AgentManagementComponent),
    canActivate: [RoleGuard],
    data: { roles: ['SUPER_ADMIN'] }
  },
  { 
    path: 'admin/candidats', 
    loadChildren: () => import('./features/candidats/candidats.routes').then(m => m.routes),
    canActivate: [RoleGuard],
    data: { roles: ['SUPER_ADMIN'] }
  },
  { 
    path: 'admin/dossiers', 
    loadChildren: () => import('./features/dossiers/dossiers.routes').then(m => m.routes),
    canActivate: [RoleGuard],
    data: { roles: ['SUPER_ADMIN'] }
  },
  { 
    path: 'admin/reports', 
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [RoleGuard],
    data: { roles: ['SUPER_ADMIN'] }
  },

  // WORKFLOW ROUTES
  { 
    path: 'workflow/:id', 
    loadComponent: () => import('./features/workflow/application-workflow.component').then(m => m.ApplicationWorkflowComponent),
    canActivate: [RoleGuard],
    data: { roles: ['AGENT', 'SUPER_ADMIN'] }
  },
  { 
    path: 'registration-form/:id', 
    loadComponent: () => import('./features/student/registration-form-download.component').then(m => m.RegistrationFormDownloadComponent),
    canActivate: [RoleGuard],
    data: { roles: ['CANDIDATE'] }
  },

  // SHARED ROUTES
  { 
    path: 'settings', 
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'debug/roles', 
    loadComponent: () => import('./features/debug/role-debug.component').then(m => m.RoleDebugComponent),
    canActivate: [AuthGuard]
  },

  // LEGACY REDIRECTS
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard-redirect.component').then(m => m.DashboardRedirectComponent),
    canActivate: [AuthGuard]
  },
  { path: 'candidats', redirectTo: '/admin/candidats' },
  { path: 'dossiers', redirectTo: '/agent/dossiers' },
  { path: 'documents', redirectTo: '/agent/documents' },
  { path: 'agents', redirectTo: '/admin/agents' },
  { path: 'notifications', redirectTo: '/candidate/notifications' },
  { path: 'reports', redirectTo: '/agent/reports' },
  
  { path: '**', redirectTo: '/auth/login' }
];

export default routes;

