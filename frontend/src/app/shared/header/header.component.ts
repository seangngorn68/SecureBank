import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { NotificationWsService, NotificationMessage } from '../../services/notification-ws.service';
import { NotificationApiService } from '../../services/notification-api.service';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  showNotifications = false;
  notifications: NotificationMessage[] = [];
  isLoadingNotifs = false;
  private wsSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationWs: NotificationWsService,
    private notificationApi: NotificationApiService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Load existing notifications from API
    this.loadNotifications();

    // Connect WebSocket for real-time
    const stored = localStorage.getItem('banking_auth');
    if (stored) {
      const auth = JSON.parse(stored);
      const token = auth.token ?? '';
      // Extract userId from JWT payload
      let userId = 'user';
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.sub ?? 'user';
      } catch {}

      this.notificationWs.connect(userId, token);
      this.wsSub = this.notificationWs.notification$.subscribe(n => {
        this.notifications.unshift(n);
      });
    }
  }

  loadNotifications(): void {
    this.isLoadingNotifs = true;
    this.notificationApi.getAll().subscribe({
      next: (data) => {
        this.notifications = data as any[];
        this.isLoadingNotifs = false;
      },
      error: () => { this.isLoadingNotifs = false; }
    });
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
    this.notificationWs.disconnect();
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) this.loadNotifications();
  }

  markAllRead(): void {
    this.notificationApi.markAllRead().subscribe();
    this.notifications.forEach(n => n.read = true);
  }

  markRead(id: number): void {
    this.notificationApi.markRead(id).subscribe();
    const n = this.notifications.find(n => n.id === id);
    if (n) n.read = true;
  }

  deleteNotif(id: number, event: Event): void {
    event.stopPropagation();
    this.notificationApi.delete(id).subscribe();
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    // Spring Boot returns LocalDateTime without timezone → append Z to parse as UTC
    const utc = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
    const diff = Date.now() - new Date(utc).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    return `${Math.floor(hrs / 24)} days ago`;
  }

  iconFor(type: string): string {
    const icons: Record<string, string> = {
      credit: '💰', debit: '💳', security: '🔒',
      system: '🔔', transfer: '🔄', account: '🏦'
    };
    return icons[type] ?? '🔔';
  }

  bgFor(type: string): string {
    const bg: Record<string, string> = {
      credit: 'bg-green-100', debit: 'bg-blue-100',
      security: 'bg-red-100', system: 'bg-gray-100',
      transfer: 'bg-purple-100', account: 'bg-blue-50'
    };
    return bg[type] ?? 'bg-gray-100';
  }
}
