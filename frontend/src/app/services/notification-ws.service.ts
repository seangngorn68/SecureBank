import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NotificationMessage {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationWsService {
  private notificationSubject = new Subject<NotificationMessage>();
  notification$ = this.notificationSubject.asObservable();
  private abortController: AbortController | null = null;

  constructor(private ngZone: NgZone) {}

  connect(_userId: string, token: string): void {
    if (!token || this.abortController) return;

    this.abortController = new AbortController();

    fetch(`${environment.apiUrl}/api/notifications/stream`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: this.abortController.signal,
    })
      .then(res => {
        if (!res.ok || !res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const pump = (): void => {
          reader.read().then(({ done, value }) => {
            if (done) return;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (line.startsWith('data:')) {
                try {
                  const payload: NotificationMessage = JSON.parse(line.slice(5).trim());
                  this.ngZone.run(() => this.notificationSubject.next(payload));
                } catch {}
              }
            }

            pump();
          }).catch(() => {});
        };

        pump();
      })
      .catch(() => {});
  }

  disconnect(): void {
    this.abortController?.abort();
    this.abortController = null;
  }
}
