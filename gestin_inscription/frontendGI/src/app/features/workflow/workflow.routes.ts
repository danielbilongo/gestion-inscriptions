import { Routes } from '@angular/router';
import { ApplicationWorkflowComponent } from './application-workflow.component';
import { AuthGuard } from '../../core/guards/auth.guard';

export const workflowRoutes: Routes = [
  {
    path: 'workflow/:id',
    component: ApplicationWorkflowComponent,
    canActivate: [AuthGuard],
    data: { roles: ['AGENT', 'ADMIN'] }
  }
];