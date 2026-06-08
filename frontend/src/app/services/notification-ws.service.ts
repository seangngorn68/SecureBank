import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client';
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
  private stompClient: Client | null = null;
  private notificationSubject = new Subject<NotificationMessage>();
  notification$ = this.notificationSubject.asObservable();

  connect(userId: string, token: string): void {
    if (!token) return; // Don't connect without token

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(`${environment.wsUrl}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },

      // ── Stop infinite retries ──────────────────────
      reconnectDelay: 0,        // ❌ Don't auto-reconnect
      heartbeatIncoming: 0,     // Disable heartbeat
      heartbeatOutgoing: 0,

      onConnect: () => {
        console.log('WebSocket connected ✅');
        this.stompClient!.subscribe(
          `/topic/notifications/${userId}`,
          (message: IMessage) => {
            const notification: NotificationMessage = JSON.parse(message.body);
            this.notificationSubject.next(notification);
          }
        );
      },

      onDisconnect: () => console.log('WebSocket disconnected'),

      // ── Silent error — don't retry ─────────────────
      onStompError: () => {
        // Fail silently — notifications loaded via REST API anyway
        this.stompClient?.deactivate();
      },

      onWebSocketError: () => {
        // Connection failed — stop trying
        this.stompClient?.deactivate();
      }
    });

    this.stompClient.activate();
  }

  disconnect(): void {
    this.stompClient?.deactivate();
    this.stompClient = null;
  }
}
