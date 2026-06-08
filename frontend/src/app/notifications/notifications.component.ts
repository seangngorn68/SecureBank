import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationApiService } from '../services/notification-api.service';
import { Notification } from '../core/models';

type FilterType = 'all' | 'unread' | 'credit' | 'debit' | 'info';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  filter: FilterType = 'all';
  isLoading = true;
  isMarkingAll = false;

  constructor(private notifApi: NotificationApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.notifApi.getAll().subscribe({
      next: data => { this.notifications = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  get filtered(): Notification[] {
    switch (this.filter) {
      case 'unread': return this.notifications.filter(n => !n.read);
      case 'credit':
      case 'debit':
      case 'info': return this.notifications.filter(n => n.type === this.filter);
      default: return this.notifications;
    }
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markRead(n: Notification): void {
    if (n.read) return;
    this.notifApi.markRead(n.id).subscribe({
      next: updated => {
        const idx = this.notifications.findIndex(x => x.id === n.id);
        if (idx !== -1) this.notifications[idx] = updated;
      }
    });
  }

  markAllRead(): void {
    this.isMarkingAll = true;
    this.notifApi.markAllRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map(n => ({ ...n, read: true }));
        this.isMarkingAll = false;
      },
      error: () => { this.isMarkingAll = false; }
    });
  }

  delete(id: number): void {
    this.notifApi.delete(id).subscribe({
      next: () => { this.notifications = this.notifications.filter(n => n.id !== id); }
    });
  }

  iconFor(type: string): string {
    const map: Record<string, string> = {
      credit: '💰', debit: '💸', info: 'ℹ️', security: '🔐', transfer: '🔄'
    };
    return map[type] ?? '🔔';
  }

  colorFor(type: string): string {
    const map: Record<string, string> = {
      credit: 'bg-green-100 text-green-600',
      debit: 'bg-red-100 text-red-600',
      security: 'bg-orange-100 text-orange-600',
      info: 'bg-blue-100 text-blue-600',
      transfer: 'bg-purple-100 text-purple-600'
    };
    return map[type] ?? 'bg-gray-100 text-gray-600';
  }
}
