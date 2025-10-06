import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Évolution des inscriptions -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Évolution des Inscriptions</h3>
        <div class="h-64 flex items-end space-x-2">
          <div *ngFor="let point of evolutionData" 
               class="flex-1 bg-blue-500 rounded-t flex flex-col justify-end items-center relative group"
               [style.height.%]="getBarHeight(point.count, maxEvolutionCount)">
            <div class="absolute -top-8 text-xs font-medium text-gray-700">{{point.count}}</div>
            <div class="absolute -bottom-6 text-xs text-gray-500 transform -rotate-45 origin-top-left">
              {{formatMonth(point.month)}}
            </div>
          </div>
        </div>
        <div class="mt-8"></div>
      </div>

      <!-- Répartition par statut -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Répartition par Statut</h3>
        <div class="flex items-center justify-center">
          <div class="relative w-64 h-64">
            <!-- Graphique en secteurs simplifié -->
            <svg viewBox="0 0 200 200" class="w-full h-full">
              <g *ngFor="let segment of statusData; let i = index">
                <path [attr.d]="getArcPath(segment, i)" 
                      [attr.fill]="segment.color"
                      class="hover:opacity-80 transition-opacity">
                </path>
              </g>
            </svg>
          </div>
          <!-- Légende -->
          <div class="ml-8 space-y-2">
            <div *ngFor="let segment of statusData" class="flex items-center">
              <div class="w-4 h-4 rounded mr-3" [style.background-color]="segment.color"></div>
              <span class="text-sm text-gray-700">{{segment.label}}: {{segment.count}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChartsComponent implements OnInit {
  evolutionData: any[] = [];
  statusData: any[] = [];
  maxEvolutionCount = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadEvolutionData();
    this.loadStatusData();
  }

  loadEvolutionData() {
    this.http.get<any>(`${environment.apiUrl}/dashboard/chart/inscriptions-evolution`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.evolutionData = response.data;
            this.maxEvolutionCount = Math.max(...this.evolutionData.map(d => d.count));
          }
        },
        error: (error) => console.error('Erreur chargement évolution:', error)
      });
  }

  loadStatusData() {
    this.http.get<any>(`${environment.apiUrl}/dashboard/chart/status-distribution`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.statusData = response.data;
          }
        },
        error: (error) => console.error('Erreur chargement statuts:', error)
      });
  }

  getBarHeight(count: number, max: number): number {
    return max > 0 ? (count / max) * 100 : 0;
  }

  formatMonth(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 
                   'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${months[parseInt(month) - 1]} ${year}`;
  }

  getArcPath(segment: any, index: number): string {
    const total = this.statusData.reduce((sum, s) => sum + s.count, 0);
    const percentage = segment.count / total;
    
    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += (this.statusData[i].count / total) * 360;
    }
    
    const endAngle = startAngle + (percentage * 360);
    
    const centerX = 100;
    const centerY = 100;
    const radius = 80;
    
    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = percentage > 0.5 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  }
}