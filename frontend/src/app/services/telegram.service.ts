import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TelegramStatus {
  connected: boolean;
  username?: string;
  chatId?: string;
  connectedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class TelegramApiService {
  private base = `${environment.apiUrl}/api/telegram`;

  constructor(private http: HttpClient) {}

  generateLink(): Observable<{ token: string; url: string; botUsername: string }> {
    return this.http.post<any>(`${this.base}/generate-link`, {});
  }

  getStatus(): Observable<TelegramStatus> {
    return this.http.get<TelegramStatus>(`${this.base}/status`);
  }

  sendTest(): Observable<{ status: string }> {
    return this.http.post<any>(`${this.base}/test`, {});
  }

  disconnect(): Observable<void> {
    return this.http.delete<void>(`${this.base}/disconnect`);
  }
}
