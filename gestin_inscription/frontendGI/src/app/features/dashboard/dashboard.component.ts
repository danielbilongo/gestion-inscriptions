import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StatisticsService, DashboardStatistics } from '../../core/services/statistics.service';
import { AuthService } from '../../core/services/auth.service';
import { HeatmapChartComponent } from '../../shared/components/heatmap-chart.component';
import { UniversityHeatmapComponent } from '../../shared/components/university-heatmap.component';
import { ChartsComponent } from '../../shared/components/charts.component';
import { ExportModalComponent, ExportOptions } from '../../shared/components/export-modal.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeatmapChartComponent, UniversityHeatmapComponent, ChartsComponent, ExportModalComponent],
  template: `
    <div class="min-h-screen bg-gray-50 py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p class="mt-2 text-gray-600" *ngIf="!isCandidate()">Vue d'ensemble des inscriptions et statistiques</p>
          <p class="mt-2 text-gray-600" *ngIf="isCandidate()">Bienvenue dans votre espace candidat</p>
        </div>

        <!-- Candidate Dashboard -->
        <div *ngIf="isCandidate()" class="space-y-6">
          <!-- Quick Actions for Candidates -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button routerLink="/inscription" 
                      class="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Nouvelle candidature
              </button>
              <button routerLink="/candidate/dossiers" 
                      class="flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Mes dossiers
              </button>
            </div>
          </div>

          <!-- Candidate Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Mes candidatures</dt>
                      <dd class="text-lg font-medium text-gray-900">{{candidateStats.totalApplications || 0}}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Approuvées</dt>
                      <dd class="text-lg font-medium text-gray-900">{{candidateStats.approved || 0}}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">En cours</dt>
                      <dd class="text-lg font-medium text-gray-900">{{candidateStats.pending || 0}}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin/Agent Dashboard -->
        <div *ngIf="!isCandidate()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Nouvelles cartes pour utilisateurs et agents -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239"/>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Utilisateurs</dt>
                    <dd class="text-lg font-medium text-gray-900">{{stats.totalUsers || 0}}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Agents</dt>
                    <dd class="text-lg font-medium text-gray-900">{{stats.totalAgents || 0}}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Candidatures</dt>
                    <dd class="text-lg font-medium text-gray-900">{{stats.totalApplications || 0}}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Approuvées</dt>
                    <dd class="text-lg font-medium text-gray-900">{{stats.approvedApplications || 0}}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">En attente</dt>
                    <dd class="text-lg font-medium text-gray-900">{{stats.pendingApplications || 0}}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Rejetées</dt>
                    <dd class="text-lg font-medium text-gray-900">{{stats.rejectedApplications || 0}}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row - Only for Admin/Agent -->
        <div *ngIf="!isCandidate()" class="space-y-6 mb-8">
          <!-- University Heatmap -->
          <app-university-heatmap></app-university-heatmap>
          
          <!-- Graphiques de rapport -->
          <app-charts></app-charts>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Heatmap -->
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Carte thermique des validations</h3>
              <app-heatmap-chart [data]="heatmapData"></app-heatmap-chart>
            </div>

            <!-- Status Chart -->
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Répartition par statut</h3>
              <div class="space-y-3">
                <div *ngFor="let status of statusData" class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full mr-3" [style.background-color]="status.color"></div>
                    <span class="text-sm text-gray-700">{{status.label}}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-medium text-gray-900">{{status.count}}</span>
                    <span class="text-xs text-gray-500">({{status.percentage}}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Applications - Only for Admin/Agent -->
        <div *ngIf="!isCandidate()" class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">Candidatures récentes</h3>
            <button (click)="showExportModal = true" 
                    class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">
              Exporter
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidat</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let app of recentApplications">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{app.candidateName}}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{app.email}}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          [ngClass]="{
                            'bg-green-100 text-green-800': app.status === 'APPROVED',
                            'bg-yellow-100 text-yellow-800': app.status === 'PENDING',
                            'bg-red-100 text-red-800': app.status === 'REJECTED',
                            'bg-blue-100 text-blue-800': app.status === 'UNDER_REVIEW'
                          }">
                      {{getStatusLabel(app.status)}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{formatDate(app.submissionDate)}}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button (click)="viewApplication(app.id)" class="text-indigo-600 hover:text-indigo-900 mr-3">Voir</button>
                    <button (click)="processApplication(app.id)" class="text-green-600 hover:text-green-900">Traiter</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Export Modal -->
        <app-export-modal 
          *ngIf="showExportModal"
          (close)="showExportModal = false"
          (export)="onExport($event.format)">
        </app-export-modal>

      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  stats: DashboardStatistics = {
    totalApplications: 0,
    approvedApplications: 0,
    pendingApplications: 0,
    rejectedApplications: 0,
    reviewApplications: 0
  };
  heatmapData: any[] = [];
  statusData: any[] = [];
  recentApplications: any[] = [];
  showExportModal = false;
  candidateStats = {
    totalApplications: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  };

  constructor(
    private statisticsService: StatisticsService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (this.isCandidate()) {
      this.loadCandidateData();
    } else {
      this.loadDashboardData();
      // Actualisation automatique toutes les 30 secondes pour admin/agent
      interval(30000)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadDashboardData());
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    // Charger les statistiques
    this.http.get<any>(`${environment.apiUrl}/dashboard/statistics`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data.success) {
            this.stats = data.statistics;
            this.updateStatusData();
          }
        },
        error: (error) => {
          console.error('Erreur chargement statistiques:', error);
          this.stats = {
            totalApplications: 0,
            approvedApplications: 0,
            pendingApplications: 0,
            rejectedApplications: 0,
            reviewApplications: 0
          };
          this.updateStatusData();
        }
      });

    // Charger les candidatures récentes
    this.http.get<any>(`${environment.apiUrl}/dashboard/recent-applications?limit=10`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data.success) {
            this.recentApplications = data.applications.map((app: any) => ({
              id: app.id,
              candidateName: app.candidatName,
              email: app.email,
              status: app.status,
              submissionDate: app.submissionDate
            }));
          }
        },
        error: (error) => {
          console.error('Erreur chargement candidatures:', error);
          this.recentApplications = [];
        }
      });
  }

  private updateStatusData(): void {
    const total = this.stats.totalApplications || 1;
    this.statusData = [
      {
        label: 'Approuvées',
        count: this.stats.approvedApplications || 0,
        percentage: Math.round(((this.stats.approvedApplications || 0) / total) * 100),
        color: '#10B981'
      },
      {
        label: 'En attente',
        count: this.stats.pendingApplications || 0,
        percentage: Math.round(((this.stats.pendingApplications || 0) / total) * 100),
        color: '#F59E0B'
      },
      {
        label: 'Rejetées',
        count: this.stats.rejectedApplications || 0,
        percentage: Math.round(((this.stats.rejectedApplications || 0) / total) * 100),
        color: '#EF4444'
      },
      {
        label: 'En révision',
        count: this.stats.reviewApplications || 0,
        percentage: Math.round(((this.stats.reviewApplications || 0) / total) * 100),
        color: '#3B82F6'
      }
    ];
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'APPROVED': 'Approuvée',
      'PENDING': 'En attente',
      'REJECTED': 'Rejetée',
      'UNDER_REVIEW': 'En révision'
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  onExport(format: 'excel' | 'csv' | 'pdf'): void {
    if (format === 'pdf') {
      // PDF export not implemented yet
      console.log('PDF export not implemented');
      this.showExportModal = false;
      return;
    }
    
    this.statisticsService.exportData(format)
      .pipe(takeUntil(this.destroy$))
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `candidatures_${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
    
    this.showExportModal = false;
  }

  isCandidate(): boolean {
    return this.authService.isCandidate();
  }

  private loadCandidateData(): void {
    this.loadActualCandidateData();
  }
  
  private loadActualCandidateData(): void {
    // Charger les statistiques spécifiques au candidat
    this.http.get<any>(`${environment.apiUrl}/dashboard/candidate/statistics`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data.success) {
            const stats = data.statistics;
            this.candidateStats = {
              totalApplications: stats.totalApplications || 0,
              approved: stats.approvedApplications || 0,
              pending: (stats.pendingApplications || 0) + (stats.reviewApplications || 0),
              rejected: stats.rejectedApplications || 0
            };
          }
        },
        error: (error) => {
          console.error('Erreur chargement statistiques candidat:', error);
          this.candidateStats = {
            totalApplications: 0,
            approved: 0,
            pending: 0,
            rejected: 0
          };
        }
      });
  }

  viewApplication(id: number): void {
    // Rediriger vers la vue détaillée
    window.location.href = `/dossiers`;
  }

  processApplication(id: number): void {
    // Rediriger vers le workflow de traitement
    window.location.href = `/workflow/${id}`;
  }
}