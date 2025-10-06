import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthTestService {

  constructor(private http: HttpClient) { }

  testAuthStatus(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/auth-test/status`);
  }

  testProtectedEndpoint(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/auth-test/protected-test`);
  }
}