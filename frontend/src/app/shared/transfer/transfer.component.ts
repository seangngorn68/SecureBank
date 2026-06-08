import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountApiService } from '../../services/account-api.service';
import { TransactionApiService } from '../../services/transaction-api.service';
import { NotificationApiService } from '../../services/notification-api.service';
import { Account } from '../../core/models';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transfer.component.html'
})
export class TransferComponent implements OnChanges {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();

  accounts: Account[] = [];
  step: 1 | 2 | 3 = 1;
  transferType: 'own' | 'external' = 'own';

  fromAccountId = 0;
  toAccountId = 0;
  recipientAccountNumber = '';
  recipientName = '';
  amount = 0;
  note = '';
  error = '';
  isSaving = false;
  success = false;

  constructor(
    private accountApi: AccountApiService,
    private transactionApi: TransactionApiService,
    private notificationApi: NotificationApiService
  ) {}

  ngOnChanges(): void {
    if (this.show) {
      this.reset();
      this.accountApi.getAll().subscribe({ next: a => this.accounts = a });
    }
  }

  reset(): void {
    this.step = 1;
    this.transferType = 'own';
    this.fromAccountId = 0;
    this.toAccountId = 0;
    this.recipientAccountNumber = '';
    this.recipientName = '';
    this.amount = 0;
    this.note = '';
    this.error = '';
    this.isSaving = false;
    this.success = false;
  }

  selectType(type: 'own' | 'external'): void {
    this.transferType = type;
    this.step = 2;
  }

  canSubmit(): boolean {
    if (!this.fromAccountId || this.amount <= 0) return false;
    if (this.transferType === 'own') return this.toAccountId > 0 && this.toAccountId !== this.fromAccountId;
    return this.recipientAccountNumber.trim().length > 0;
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.isSaving = true;
    this.error = '';

    if (this.transferType === 'own') {
      this.transactionApi.transfer(this.fromAccountId, this.toAccountId, this.amount, this.note).subscribe({
        next: () => this.onSuccess('Internal transfer between accounts'),
        error: err => this.onError(err)
      });
    } else {
      this.transactionApi.sendMoney(this.fromAccountId, this.recipientAccountNumber, this.amount, this.note).subscribe({
        next: () => this.onSuccess(`Sent to ${this.recipientName || this.recipientAccountNumber}`),
        error: err => this.onError(err)
      });
    }
  }

  private onSuccess(detail: string): void {
    this.notificationApi.create({
      title: 'Transfer Successful',
      message: `${this.fmt(this.amount)} transferred. ${detail}`,
      type: 'debit'
    }).subscribe();
    this.isSaving = false;
    this.step = 3;
  }

  private onError(err: any): void {
    this.isSaving = false;
    this.error = err?.status === 400 ? 'Insufficient balance or invalid account.'
      : err?.status === 404 ? 'Recipient account not found.'
      : err?.status === 401 ? 'Session expired. Please log in again.'
      : 'Transfer failed. Please try again.';
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  }
}
