import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReviewDecision {
  reason?: string;
  nonCompliantDocument?: string;
  customMessage?: string;
  comment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationReviewService {
  private apiUrl = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  processApplication(applicationId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${applicationId}/process`, {});
  }

  approveApplication(applicationId: number, comment?: string): Observable<any> {
    const body = comment ? { comment } : {};
    return this.http.post(`${this.apiUrl}/${applicationId}/approve`, body);
  }

  rejectApplication(applicationId: number, decision: ReviewDecision): Observable<any> {
    return this.http.post(`${this.apiUrl}/${applicationId}/reject`, decision);
  }
}