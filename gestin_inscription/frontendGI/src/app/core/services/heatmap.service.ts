import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface HeatmapPoint {
  name: string;
  lat: number;
  lng: number;
  count: number;
  intensity: number;
}

export interface HeatmapResponse {
  success: boolean;
  data: HeatmapPoint[];
  totalApplications: number;
}

@Injectable({
  providedIn: 'root'
})
export class HeatmapService {
  constructor(private http: HttpClient) {}

  getHeatmapData(): Observable<HeatmapResponse> {
    return this.http.get<HeatmapResponse>(`${environment.apiUrl}/applications/heatmap-data`);
  }
}