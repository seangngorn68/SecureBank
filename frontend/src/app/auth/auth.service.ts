import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'banking_auth';
  private readonly base = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem(this.storageKey, JSON.stringify({
          token: res.access_token,
          loggedIn: true
        }));
      })
    );
  }

  register(username: string, email: string, password: string): Observable<string> {
    return this.http.post(`${this.base}/register`, { username, email, password }, { responseType: 'text' }).pipe(
      tap(() => localStorage.setItem(this.storageKey, JSON.stringify({ loggedIn: true })))
    );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  isAuthenticated(): boolean {
    const data = localStorage.getItem(this.storageKey);
    if (!data) return false;
    return JSON.parse(data).loggedIn === true;
  }

  getToken(): string | null {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data).token : null;
  }
}
