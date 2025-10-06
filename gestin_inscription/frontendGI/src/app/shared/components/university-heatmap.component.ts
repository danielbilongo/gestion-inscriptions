import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeatmapService, HeatmapPoint } from '../../core/services/heatmap.service';

@Component({
  selector: 'app-university-heatmap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold mb-4">Carte thermique des inscriptions par université</h3>
      
      <div class="relative bg-gray-100 rounded-lg p-4 min-h-96">
        <!-- Carte du Cameroun simplifiée -->
        <svg viewBox="0 0 400 300" class="w-full h-full">
          <!-- Contour simplifié du Cameroun -->
          <path d="M50 50 L350 50 L350 250 L50 250 Z" 
                fill="#f3f4f6" 
                stroke="#d1d5db" 
                stroke-width="2"/>
          
          <!-- Points des universités -->
          <g *ngFor="let point of heatmapData">
            <circle 
              [attr.cx]="getX(point.lng)" 
              [attr.cy]="getY(point.lat)"
              [attr.r]="getRadius(point.count)"
              [attr.fill]="getColor(point.intensity)"
              [attr.opacity]="0.7"
              class="cursor-pointer hover:opacity-100 transition-opacity"
              [attr.title]="point.name + ': ' + point.count + ' inscriptions'">
            </circle>
            
            <!-- Labels des universités -->
            <text 
              [attr.x]="getX(point.lng)" 
              [attr.y]="getY(point.lat) - getRadius(point.count) - 5"
              text-anchor="middle"
              class="text-xs font-medium fill-gray-700">
              {{point.name.split(' ').slice(-1)[0]}}
            </text>
            
            <!-- Nombre d'inscriptions -->
            <text 
              [attr.x]="getX(point.lng)" 
              [attr.y]="getY(point.lat) + 4"
              text-anchor="middle"
              class="text-xs font-bold fill-white">
              {{point.count}}
            </text>
          </g>
        </svg>
        
        <!-- Légende -->
        <div class="absolute bottom-4 right-4 bg-white p-3 rounded shadow">
          <h4 class="text-sm font-semibold mb-2">Légende</h4>
          <div class="space-y-1">
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 rounded-full bg-blue-200"></div>
              <span class="text-xs">1-5 inscriptions</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 rounded-full bg-blue-400"></div>
              <span class="text-xs">6-10 inscriptions</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 rounded-full bg-blue-600"></div>
              <span class="text-xs">11+ inscriptions</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Statistiques -->
      <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div *ngFor="let point of heatmapData" class="text-center p-3 bg-gray-50 rounded">
          <div class="text-lg font-bold text-blue-600">{{point.count}}</div>
          <div class="text-xs text-gray-600">{{point.name}}</div>
        </div>
      </div>
      
      <div class="mt-4 text-center text-sm text-gray-500">
        Total des inscriptions: {{totalApplications}}
      </div>
    </div>
  `
})
export class UniversityHeatmapComponent implements OnInit {
  heatmapData: HeatmapPoint[] = [];
  totalApplications = 0;

  constructor(private heatmapService: HeatmapService) {}

  ngOnInit(): void {
    this.loadHeatmapData();
  }

  private loadHeatmapData(): void {
    this.heatmapService.getHeatmapData().subscribe({
      next: (response) => {
        if (response.success) {
          this.heatmapData = response.data;
          this.totalApplications = response.totalApplications;
        }
      },
      error: (error) => {
        console.error('Erreur chargement carte thermique:', error);
      }
    });
  }

  getX(lng: number): number {
    // Convertir longitude en coordonnée X (simplifié)
    return 50 + ((lng - 9) / (14 - 9)) * 300;
  }

  getY(lat: number): number {
    // Convertir latitude en coordonnée Y (simplifié, inversé)
    return 250 - ((lat - 2) / (13 - 2)) * 200;
  }

  getRadius(count: number): number {
    return Math.max(8, Math.min(25, count * 2));
  }

  getColor(intensity: number): string {
    if (intensity < 0.3) return '#dbeafe'; // blue-100
    if (intensity < 0.6) return '#60a5fa'; // blue-400
    return '#2563eb'; // blue-600
  }
}