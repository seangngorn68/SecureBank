import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../core/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private base = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, req);
  }

  register(req: RegisterRequest): Observable<string> {
    return this.http.post(`${this.base}/register`, req, { responseType: 'text' });
  }

  getMe(): Observable<{ userId: string; username: string; email: string }> {
    return this.http.get<{ userId: string; username: string; email: string }>(`${this.base}/me`);
  }
}
