import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Document } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(private http: HttpClient) {}

  getDocumentsByDossierId(dossierId: number): Observable<Document[]> {
    const applicationId = dossierId;
    return this.http.get<Document[]>(`${environment.apiUrl}/documents/application/${applicationId}`);
  }

  getAllDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(`${environment.apiUrl}/documents/all`);
  }

  uploadDocument(dossierId: number, file: File, type: string): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', type);
    
    return this.http.post<Document>(`${environment.apiUrl}/documents/upload/${dossierId}`, formData);
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/documents/${id}`);
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/documents/${id}/download`, {
      responseType: 'blob'
    });
  }

  validateDocument(documentId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/documents/validate/${documentId}`, {});
  }
}