import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AccountApiService } from '../services/account-api.service';
import { NotificationApiService } from '../services/notification-api.service';
import { SavingsGoalService, SavingsGoal } from '../services/savings-goal.service';
import { StripeDepositComponent } from '../shared/stripe-deposit/stripe-deposit.component';
import { Account } from '../core/models';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StripeDepositComponent],
  templateUrl: './accounts.component.html'
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  isLoading = true;
  error = '';

  // ── Add Account Modal ────────────────────────────
  showModal = false;
  isSaving = false;
  saveError = '';
  newAccount = { name: '', type: 'Checking', balance: 0, interestRate: '' };
  accountTypes = [
    { value: 'Checking',   label: 'Checking',   icon: '🏦', interest: '0.05% APY' },
    { value: 'Savings',    label: 'Savings',    icon: '💰', interest: '4.50% APY' },
    { value: 'Investment', label: 'Investment', icon: '📈', interest: '7.20% APY' },
  ];

  // ── Stripe Deposit Modal ─────────────────────────
  showStripeDeposit = false;

  // ── Top Up Modal ─────────────────────────────────
  showTopUpModal = false;
  topUpAccountId: number | null = null;
  topUpAmount = 0;
  isTopUpSaving = false;
  topUpError = '';

  // ── Savings Goals ─────────────────────────────────
  goals: SavingsGoal[] = [];
  showGoalModal = false;
  showDepositGoalModal = false;
  depositGoalId = '';
  depositAmount = 0;
  newGoal = { name: '', icon: '🎯', target: 0, color: '#3b82f6', deadline: '' };
  goalIcons = ['🎯','🏠','🚗','✈️','💍','📱','🎓','💻','🏖️','💰'];
  goalColors = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#84cc16','#f97316'];

  constructor(
    private accountApi: AccountApiService,
    private notificationApi: NotificationApiService,
    public goalService: SavingsGoalService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.goalService.goals.subscribe(g => this.goals = g);
  }

  // ── Account CRUD ──────────────────────────────────
  loadAccounts(): void {
    this.isLoading = true;
    this.accountApi.getAll().subscribe({
      next: data => { this.accounts = data; this.isLoading = false; },
      error: () => { this.error = 'Failed to load accounts.'; this.isLoading = false; }
    });
  }

  openModal(): void {
    this.newAccount = { name: '', type: 'Checking', balance: 0, interestRate: '' };
    this.saveError = '';
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  onTypeChange(): void {
    const sel = this.accountTypes.find(t => t.value === this.newAccount.type);
    this.newAccount.interestRate = sel?.interest ?? '';
  }

  interestFor(type: string): string {
    return this.accountTypes.find(t => t.value === type)?.interest ?? '—';
  }

  saveAccount(): void {
    if (!this.newAccount.name.trim()) { this.saveError = 'Account name is required.'; return; }
    this.isSaving = true;
    this.saveError = '';
    const payload: Partial<Account> = {
      name: this.newAccount.name.trim(),
      type: this.newAccount.type,
      balance: Number(this.newAccount.balance) || 0,
      interestRate: this.newAccount.interestRate,
      number: '****' + Math.floor(1000 + Math.random() * 9000)
    };
    this.accountApi.create(payload as Account).subscribe({
      next: () => {
        this.isSaving = false; this.showModal = false; this.loadAccounts();
        this.notificationApi.create({ title: 'Account Created',
          message: `Your ${this.newAccount.type} account "${this.newAccount.name}" was created.`,
          type: 'account' }).subscribe();
      },
      error: (err) => {
        this.isSaving = false;
        this.saveError = err?.status === 401 ? 'Session expired.' : 'Failed to create account.';
      }
    });
  }

  // ── Top Up ────────────────────────────────────────
  openTopUp(account: Account): void {
    this.topUpAccountId = account.id;
    this.topUpAmount = 0; this.topUpError = ''; this.showTopUpModal = true;
  }
  closeTopUp(): void { this.showTopUpModal = false; }

  doTopUp(): void {
    if (!this.topUpAmount || this.topUpAmount <= 0) { this.topUpError = 'Enter a valid amount.'; return; }
    this.isTopUpSaving = true; this.topUpError = '';
    this.accountApi.topUp(this.topUpAccountId!, this.topUpAmount).subscribe({
      next: () => {
        this.isTopUpSaving = false; this.showTopUpModal = false; this.loadAccounts();
        this.notificationApi.create({ title: 'Deposit Successful',
          message: `$${this.topUpAmount.toFixed(2)} deposited successfully.`, type: 'credit' }).subscribe();
      },
      error: (err) => {
        this.isTopUpSaving = false;
        this.topUpError = err?.status === 401 ? 'Session expired.' : 'Top up failed.';
      }
    });
  }
  selectedAccountName(): string {
    return this.accounts.find(a => a.id === this.topUpAccountId)?.name ?? '';
  }

  // ── Savings Goals ─────────────────────────────────
  openGoalModal(): void {
    this.newGoal = { name: '', icon: '🎯', target: 0, color: '#3b82f6', deadline: '' };
    this.showGoalModal = true;
  }
  closeGoalModal(): void { this.showGoalModal = false; }

  addGoal(): void {
    if (!this.newGoal.name || !this.newGoal.target) return;
    this.goalService.add({ ...this.newGoal, saved: 0 });
    this.showGoalModal = false;
  }

  openDepositGoal(id: string): void {
    this.depositGoalId = id; this.depositAmount = 0; this.showDepositGoalModal = true;
  }

  depositToGoal(): void {
    if (!this.depositAmount || this.depositAmount <= 0) return;
    this.goalService.deposit(this.depositGoalId, this.depositAmount);
    this.showDepositGoalModal = false;
  }

  goalProgress(g: SavingsGoal): number {
    return Math.min(Math.round((g.saved / g.target) * 100), 100);
  }

  goalName(id: string): string {
    return this.goals.find(g => g.id === id)?.name ?? '';
  }

  // ── Helpers ───────────────────────────────────────
  iconFor(type: string): string {
    return ({ Checking: '🏦', Savings: '💰', Investment: '📈' } as any)[type] ?? '🏦';
  }
  iconBgFor(type: string): string {
    return ({ Checking: 'bg-blue-100', Savings: 'bg-green-100', Investment: 'bg-purple-100' } as any)[type] ?? 'bg-gray-100';
  }
  badgeFor(type: string): string {
    return ({ Checking: 'bg-blue-100 text-blue-700', Savings: 'bg-green-100 text-green-700',
              Investment: 'bg-purple-100 text-purple-700' } as any)[type] ?? 'bg-gray-100 text-gray-700';
  }
  fmt(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  }
}
