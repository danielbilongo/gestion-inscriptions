import { Routes } from '@angular/router';
import { CandidatProfileComponent } from './candidat-profile.component';
import { CandidatListComponent } from './candidat-list.component';

export const routes: Routes = [
  { path: '', component: CandidatListComponent },
  { path: 'list', component: CandidatListComponent }
];