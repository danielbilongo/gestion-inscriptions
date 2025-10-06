import { Routes } from '@angular/router';
import { DossierManagementComponent } from './dossier-management.component';

export const routes: Routes = [
  { path: '', redirectTo: 'management', pathMatch: 'full' },
  { path: 'management', component: DossierManagementComponent }
];