import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../core/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private base = `${environment.apiUrl}/api/notifications`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.base);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/unread-count`);
  }

  markRead(id: number): Observable<Notification> {
    return this.http.patch<Notification>(`${this.base}/${id}/read`, {});
  }

  markAllRead(): Observable<void> {
    return this.http.patch<void>(`${this.base}/read-all`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  create(notification: { title: string; message: string; type: string }): Observable<Notification> {
    return this.http.post<Notification>(this.base, notification);
  }
}
