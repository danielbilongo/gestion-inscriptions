import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  private handleError(error: any) {
    const message = error.error?.message || `Erreur ${error.status}: ${error.statusText}`;
    return throwError(() => new Error(message));
  }

  get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
    return this.http.get<T>(`${environment.apiUrl}${path}`, {
      headers: this.getHeaders(), params
    }).pipe(retry(1), catchError(this.handleError));
  }

  post<T>(path: string, body: any = {}): Observable<T> {
    return this.http.post<T>(`${environment.apiUrl}${path}`, body, {
      headers: this.getHeaders()
    }).pipe(retry(1), catchError(this.handleError));
  }

  put<T>(path: string, body: any = {}): Observable<T> {
    return this.http.put<T>(`${environment.apiUrl}${path}`, body, {
      headers: this.getHeaders()
    }).pipe(retry(1), catchError(this.handleError));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${environment.apiUrl}${path}`, {
      headers: this.getHeaders()
    }).pipe(retry(1), catchError(this.handleError));
  }

  getBlob(path: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}${path}`, {
      responseType: 'blob'
    }).pipe(retry(1), catchError(this.handleError));
  }
}