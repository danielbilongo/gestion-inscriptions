import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
  read: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private api: ApiService) {}

  getMyNotifications(): Observable<any> {
    return this.api.get<any>('/notifications/my');
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.api.post<any>(`/notifications/${notificationId}/read`, {});
  }

  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }

  // Méthode pour traiter une candidature avec notifications
  processApplication(applicationId: number, decision: string, comment?: string): Observable<any> {
    const params = new URLSearchParams();
    params.append('decision', decision);
    if (comment) {
      params.append('comment', comment);
    }
    
    return this.api.post<any>(`/applications/${applicationId}/process?${params.toString()}`, {});
  }
}