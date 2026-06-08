import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { UserService, CurrentUser } from '../services/user.service';
import { AccountApiService } from '../services/account-api.service';
import { TransactionApiService } from '../services/transaction-api.service';
import { TelegramApiService, TelegramStatus } from '../services/telegram.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: CurrentUser | null = null;
  accountCount = 0;
  totalBalance = 0;
  transactionCount = 0;
  isLoading = true;

  keycloakProfileUrl = `${environment.keycloakUrl}/realms/microservices-realm/account`;

  // Telegram state
  telegramStatus: TelegramStatus = { connected: false };
  telegramLinking = false;
  telegramTestSent = false;
  telegramDisconnecting = false;
  private pollSub?: Subscription;
  private linkCountdown = 0;
  private countdownSub?: Subscription;

  get linkCountdownDisplay(): number { return this.linkCountdown; }

  constructor(
    private userService: UserService,
    private accountApi: AccountApiService,
    private transactionApi: TransactionApiService,
    private telegramApi: TelegramApiService
  ) {}

  ngOnInit(): void {
    this.userService.load().subscribe(u => { this.user = u; });
    this.accountApi.getSummary().subscribe(s => { this.totalBalance = s.totalBalance; });
    this.accountApi.getAll().subscribe(a => { this.accountCount = a.length; this.isLoading = false; });
    this.transactionApi.getAll().subscribe(t => { this.transactionCount = t.length; });
    this.loadTelegramStatus();
  }

  loadTelegramStatus(): void {
    this.telegramApi.getStatus().subscribe({
      next: s => this.telegramStatus = s,
      error: () => {}
    });
  }

  connectTelegram(): void {
    this.telegramLinking = true;
    this.telegramApi.generateLink().subscribe({
      next: (res) => {
        // Open Telegram deep link
        window.open(res.url, '_blank');

        // Start countdown 10 minutes
        this.linkCountdown = 600;
        this.countdownSub = interval(1000).subscribe(() => {
          this.linkCountdown--;
          if (this.linkCountdown <= 0) this.countdownSub?.unsubscribe();
        });

        // Poll status every 3 seconds until connected
        this.pollSub = interval(3000).pipe(
          switchMap(() => this.telegramApi.getStatus()),
          takeWhile(s => !s.connected, true)
        ).subscribe(s => {
          this.telegramStatus = s;
          if (s.connected) {
            this.telegramLinking = false;
            this.countdownSub?.unsubscribe();
            this.pollSub?.unsubscribe();
          }
        });
      },
      error: () => { this.telegramLinking = false; }
    });
  }

  cancelConnect(): void {
    this.telegramLinking = false;
    this.linkCountdown = 0;
    this.pollSub?.unsubscribe();
    this.countdownSub?.unsubscribe();
  }

  sendTestMessage(): void {
    this.telegramTestSent = false;
    this.telegramApi.sendTest().subscribe({
      next: () => { this.telegramTestSent = true; setTimeout(() => this.telegramTestSent = false, 3000); },
      error: () => {}
    });
  }

  disconnectTelegram(): void {
    if (!confirm('Disconnect Telegram notifications?')) return;
    this.telegramDisconnecting = true;
    this.telegramApi.disconnect().subscribe({
      next: () => {
        this.telegramStatus = { connected: false };
        this.telegramDisconnecting = false;
      },
      error: () => { this.telegramDisconnecting = false; }
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
    this.countdownSub?.unsubscribe();
  }

  get initials(): string { return this.userService.initials; }
  get displayName(): string { return this.userService.displayName; }

  fmt(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);
  }
}
