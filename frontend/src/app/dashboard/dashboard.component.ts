import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AccountApiService } from '../services/account-api.service';
import { TransactionApiService } from '../services/transaction-api.service';
import { UserService } from '../services/user.service';
import { ThemeService } from '../services/theme.service';
import { QrModalComponent } from '../shared/qr-modal/qr-modal.component';
import { PayBillComponent } from '../shared/pay-bill/pay-bill.component';
import { TransferComponent } from '../shared/transfer/transfer.component';
import { AccountSummary, Transaction } from '../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe, QrModalComponent, PayBillComponent, TransferComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  today = new Date();
  summary: AccountSummary | null = null;
  recentTransactions: Transaction[] = [];
  isLoading = true;
  showQr = false;
  showPayBill = false;
  showTransfer = false;

  // Currency converter
  usdAmount = 1;
  khrRate = 4100;  // approximate rate
  get khrAmount(): number { return this.usdAmount * this.khrRate; }
  get usdFromKhr(): number { return this.khrAmount / this.khrRate; }
  converterMode: 'usd2khr' | 'khr2usd' = 'usd2khr';
  khrInput = 4100;

  constructor(
    private accountApi: AccountApiService,
    private transactionApi: TransactionApiService,
    public userService: UserService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    forkJoin({
      account: this.accountApi.getSummary(),
      monthly: this.transactionApi.getMonthlySummary(),
      recent: this.transactionApi.getRecent()
    }).subscribe({
      next: ({ account, monthly, recent }) => {
        this.summary = {
          ...account,
          monthlyIncome: monthly.monthlyIncome,
          monthlyExpenses: monthly.monthlyExpenses,
          savings: account.savings,
          incomeChange: monthly.monthlyIncome > 0
            ? `+${this.fmt(monthly.monthlyIncome)} this month` : 'No income yet',
          expenseChange: monthly.monthlyExpenses > 0
            ? `-${this.fmt(monthly.monthlyExpenses)} this month` : 'No expenses yet',
          savingsChange: account.savings > 0
            ? `${this.fmt(account.savings)} saved` : 'Start saving!'
        };
        this.recentTransactions = recent;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  goTo(path: string): void { this.router.navigate([path]); }

  iconFor(category: string): string {
    const map: Record<string, string> = {
      Income: '💼', Entertainment: '🎬', Food: '🛒',
      Utilities: '⚡', Cash: '🏧', Interest: '💹', Transfer: '🔄', Deposit: '💵'
    };
    return map[category] ?? '💳';
  }

  bgFor(type: string): string { return type === 'credit' ? 'bg-green-100' : 'bg-blue-100'; }

  fmt(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount ?? 0);
  }

  fmtKhr(amount: number): string {
    return new Intl.NumberFormat('km-KH').format(Math.round(amount)) + ' ៛';
  }
}
