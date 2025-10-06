import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsService, CountryStatistics } from '../../core/services/statistics.service';

@Component({
  selector: 'app-heatmap-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="heatmap-container">
      <!-- Hours header -->
      <div class="grid grid-cols-25 gap-1 mb-2">
        <div class="text-xs text-gray-500"></div>
        <div *ngFor="let hour of hours" class="text-xs text-gray-500 text-center">
          {{hour % 4 === 0 ? hour : ''}}
        </div>
      </div>
      
      <!-- Heatmap grid -->
      <div *ngFor="let day of days; let dayIndex = index" class="grid grid-cols-25 gap-1 mb-1">
        <div class="text-xs text-gray-500 w-8">{{day}}</div>
        <div *ngFor="let hour of hours" 
             class="w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110"
             [style.background-color]="getColor(getValue(dayIndex, hour))"
             [title]="getTooltip(day, hour, getValue(dayIndex, hour))">
        </div>
      </div>
      
      <!-- Legend -->
      <div class="flex items-center justify-between mt-4 text-xs text-gray-500">
        <span>Moins</span>
        <div class="flex space-x-1">
          <div *ngFor="let color of legendColors" 
               class="w-3 h-3 rounded-sm"
               [style.background-color]="color">
          </div>
        </div>
        <span>Plus</span>
      </div>
    </div>
  `,
  styles: [`
    .grid-cols-25 {
      grid-template-columns: repeat(25, minmax(0, 1fr));
    }
  `]
})
export class HeatmapChartComponent implements OnChanges, OnInit {
  @Input() data: any[] = [];

  days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  hours = Array.from({length: 24}, (_, i) => i);
  legendColors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];
  
  private dataMap = new Map<string, number>();

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    this.loadHeatmapData();
  }

  ngOnChanges(): void {
    this.buildDataMap();
  }

  private loadHeatmapData(): void {
    this.statisticsService.getStatisticsByCountry()
      .subscribe({
        next: (data: CountryStatistics[]) => {
          // Process country data if needed
        },
        error: (error: any) => {
          console.error('Error loading heatmap data:', error);
        }
      });
  }

  private buildDataMap(): void {
    this.dataMap.clear();
    this.data.forEach(item => {
      const key = `${item.day}-${item.hour}`;
      this.dataMap.set(key, item.value);
    });
  }

  getValue(day: number, hour: number): number {
    const key = `${day}-${hour}`;
    return this.dataMap.get(key) || 0;
  }

  getColor(value: number): string {
    if (value === 0) return this.legendColors[0];
    if (value <= 2) return this.legendColors[1];
    if (value <= 4) return this.legendColors[2];
    if (value <= 6) return this.legendColors[3];
    return this.legendColors[4];
  }

  getTooltip(day: string, hour: number, value: number): string {
    return `${day} ${hour}h: ${value} validations`;
  }
}