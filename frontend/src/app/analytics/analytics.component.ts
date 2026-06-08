import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { TransactionApiService } from '../services/transaction-api.service';
import { AccountApiService } from '../services/account-api.service';
import { Transaction, Account } from '../core/models';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './analytics.component.html'
})
export class AnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('incomeExpenseChart') incomeExpenseRef!: ElementRef;
  @ViewChild('categoryChart') categoryRef!: ElementRef;
  @ViewChild('balanceChart') balanceRef!: ElementRef;

  transactions: Transaction[] = [];
  accounts: Account[] = [];
  isLoading = true;

  // Summary stats
  totalIncome = 0;
  totalExpenses = 0;
  netSavings = 0;
  totalBalance = 0;
  transactionCount = 0;
  avgTransaction = 0;

  // Category breakdown
  categoryData: { name: string; amount: number; percent: number; color: string; icon: string }[] = [];

  // Top transactions
  topExpenses: Transaction[] = [];

  private charts: Chart[] = [];

  private categoryColors: Record<string, { color: string; icon: string }> = {
    'Transfer':      { color: '#3b82f6', icon: '🔄' },
    'Income':        { color: '#10b981', icon: '💼' },
    'Food':          { color: '#f59e0b', icon: '🛒' },
    'Entertainment': { color: '#ef4444', icon: '🎬' },
    'Utilities':     { color: '#8b5cf6', icon: '⚡' },
    'Cash':          { color: '#6b7280', icon: '🏧' },
    'Interest':      { color: '#14b8a6', icon: '💹' },
    'Deposit':       { color: '#22c55e', icon: '💵' },
    'Other':         { color: '#94a3b8', icon: '💳' }
  };

  constructor(
    private transactionApi: TransactionApiService,
    private accountApi: AccountApiService
  ) {}

  ngOnInit(): void {
    Promise.all([
      this.transactionApi.getAll().toPromise(),
      this.accountApi.getAll().toPromise(),
    ]).then(([txs, accs]) => {
      this.transactions = txs || [];
      this.accounts = accs || [];
      this.computeStats();
      this.isLoading = false;
    }).catch(() => { this.isLoading = false; });
  }

  ngAfterViewInit(): void {
    // Charts render after data loads via isLoading flag
  }

  private computeStats(): void {
    const credits = this.transactions.filter(t => t.type === 'credit');
    const debits  = this.transactions.filter(t => t.type === 'debit');

    this.totalIncome   = credits.reduce((s, t) => s + Number(t.amount), 0);
    this.totalExpenses = debits.reduce((s, t) => s + Number(t.amount), 0);
    this.netSavings    = this.totalIncome - this.totalExpenses;
    this.totalBalance  = this.accounts.reduce((s, a) => s + Number(a.balance), 0);
    this.transactionCount = this.transactions.length;
    this.avgTransaction = this.transactionCount > 0
      ? (this.totalIncome + this.totalExpenses) / this.transactionCount : 0;

    // Category breakdown (debits only)
    const catMap: Record<string, number> = {};
    debits.forEach(t => {
      const cat = t.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + Number(t.amount);
    });

    const total = Object.values(catMap).reduce((s, v) => s + v, 0) || 1;
    this.categoryData = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, amount]) => ({
        name,
        amount,
        percent: Math.round((amount / total) * 100),
        color: this.categoryColors[name]?.color || '#94a3b8',
        icon: this.categoryColors[name]?.icon || '💳'
      }));

    // Top 5 expenses
    this.topExpenses = [...debits].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5);

    // Render charts after data ready
    setTimeout(() => this.renderCharts(), 100);
  }

  private renderCharts(): void {
    this.renderIncomeExpenseChart();
    this.renderCategoryChart();
    this.renderBalanceChart();
  }

  private renderIncomeExpenseChart(): void {
    if (!this.incomeExpenseRef) return;
    const ctx = this.incomeExpenseRef.nativeElement.getContext('2d');

    // Group by day
    const dayMap: Record<string, { income: number; expense: number }> = {};
    this.transactions.forEach(t => {
      const day = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dayMap[day]) dayMap[day] = { income: 0, expense: 0 };
      if (t.type === 'credit') dayMap[day].income += Number(t.amount);
      else dayMap[day].expense += Number(t.amount);
    });

    const labels = Object.keys(dayMap).slice(-7);
    const incomeData  = labels.map(d => dayMap[d].income);
    const expenseData = labels.map(d => dayMap[d].expense);

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['No data'],
        datasets: [
          { label: 'Income', data: incomeData, backgroundColor: '#10b981', borderRadius: 6 },
          { label: 'Expenses', data: expenseData, backgroundColor: '#ef4444', borderRadius: 6 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: (v) => '$' + v } }
        }
      }
    });
    this.charts.push(chart);
  }

  private renderCategoryChart(): void {
    if (!this.categoryRef || !this.categoryData.length) return;
    const ctx = this.categoryRef.nativeElement.getContext('2d');

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.categoryData.map(c => c.name),
        datasets: [{
          data: this.categoryData.map(c => c.amount),
          backgroundColor: this.categoryData.map(c => c.color),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' },
          tooltip: { callbacks: { label: (ctx) => ` $${Number(ctx.raw).toFixed(2)}` } }
        },
        cutout: '65%'
      }
    });
    this.charts.push(chart);
  }

  private renderBalanceChart(): void {
    if (!this.balanceRef) return;
    const ctx = this.balanceRef.nativeElement.getContext('2d');

    // Simulate balance over time from transactions
    const sorted = [...this.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let running = this.totalBalance;
    const points: { label: string; value: number }[] = [];

    // Walk backwards to reconstruct balance history
    const reversed = [...sorted].reverse();
    reversed.forEach(t => {
      points.unshift({ label: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: running });
      running += t.type === 'credit' ? -Number(t.amount) : Number(t.amount);
    });
    points.unshift({ label: 'Start', value: running });

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: points.map(p => p.label),
        datasets: [{
          label: 'Balance',
          data: points.map(p => p.value),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#3b82f6'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { ticks: { callback: (v) => '$' + v } }
        }
      }
    });
    this.charts.push(chart);
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);
  }
}
