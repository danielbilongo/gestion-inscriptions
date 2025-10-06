import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStatistics {
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  reviewApplications: number;
  totalUsers?: number;
  totalAgents?: number;
  completionRate?: number;
  averageProcessingTime?: number;
  blockedApplicationsCount?: number;
  monthlyGrowth?: number;
}

export interface CountryStatistics {
  country: string;
  count: number;
  percentage: number;
}

export interface CompletionRateStats {
  step: string;
  completionRate: number;
  averageTime: number;
}

export interface MonthlyTrend {
  month: string;
  applications: number;
  approvals: number;
  rejections: number;
}

export interface ValidationHeatmap {
  day: number;
  hour: number;
  value: number;
  dayName: string;
}

export interface AgentPerformance {
  agentId: number;
  agentName: string;
  processedApplications: number;
  averageProcessingTime: number;
  approvalRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getDashboardStatistics(): Observable<DashboardStatistics> {
    return this.http.get<DashboardStatistics>(`${this.apiUrl}/dashboard`);
  }

  getCompletionRates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/completion-rates`);
  }

  getMonthlyTrends(): Observable<any> {
    return this.http.get(`${this.apiUrl}/trends/monthly`);
  }

  getValidationHeatmap(): Observable<any> {
    return this.http.get(`${this.apiUrl}/heatmap/validations`);
  }

  getBlockedApplications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/blocked-applications`);
  }

  getAgentPerformance(): Observable<any> {
    return this.http.get(`${this.apiUrl}/agent-performance`);
  }

  getTopCountries(): Observable<any> {
    return this.http.get(`${this.apiUrl}/countries/top`);
  }

  getHeatmapData(): Observable<any[]> {
    return new Observable(observer => {
      const data = this.generateHeatmapData();
      observer.next(data);
      observer.complete();
    });
  }

  getRecentApplications(): Observable<any[]> {
    return new Observable(observer => {
      const apps = [
        {
          id: 1,
          candidateName: 'Jean Dupont',
          email: 'jean.dupont@email.com',
          status: 'PENDING',
          submissionDate: new Date().toISOString()
        },
        {
          id: 2,
          candidateName: 'Marie Martin',
          email: 'marie.martin@email.com',
          status: 'APPROVED',
          submissionDate: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      observer.next(apps);
      observer.complete();
    });
  }

  getMyCandidateApplications(): Observable<any[]> {
    // Utiliser l'endpoint spécifique pour les candidatures du candidat connecté
    return this.http.get<any[]>(`${environment.apiUrl}/applications/my-applications`);
  }

  getStatisticsByCountry(): Observable<CountryStatistics[]> {
    return new Observable(observer => {
      const data: CountryStatistics[] = [
        { country: 'France', count: 45, percentage: 60 },
        { country: 'Algérie', count: 20, percentage: 27 },
        { country: 'Maroc', count: 10, percentage: 13 }
      ];
      observer.next(data);
      observer.complete();
    });
  }

  exportData(format: 'excel' | 'csv'): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/export/${format}`, {
      responseType: 'blob'
    });
  }

  private generateHeatmapData(): any[] {
    const data: any[] = [];
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const hours = Array.from({length: 24}, (_, i) => i);

    days.forEach((day, dayIndex) => {
      hours.forEach(hour => {
        data.push({
          day: dayIndex,
          hour,
          value: Math.floor(Math.random() * 10),
          dayName: day
        });
      });
    });

    return data;
  }
}