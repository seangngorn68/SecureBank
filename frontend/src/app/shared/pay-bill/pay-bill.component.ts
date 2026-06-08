import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountApiService } from '../../services/account-api.service';
import { NotificationApiService } from '../../services/notification-api.service';
import { Account } from '../../core/models';

interface BillType {
  id: string;
  name: string;
  icon: string;
  color: string;
  placeholder: string;
}

@Component({
  selector: 'app-pay-bill',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pay-bill.component.html'
})
export class PayBillComponent implements OnChanges {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();

  accounts: Account[] = [];
  selectedAccountId: number = 0;
  selectedBill: BillType | null = null;
  billNumber = '';
  amount = 0;
  isSaving = false;
  error = '';
  success = false;
  step: 1 | 2 = 1;

  billTypes: BillType[] = [
    { id: 'electricity', name: 'Electricity (EDC)', icon: '⚡', color: 'bg-yellow-100', placeholder: 'e.g. 1234567' },
    { id: 'water',       name: 'Water (PPWSA)',    icon: '💧', color: 'bg-blue-100',   placeholder: 'e.g. 78901' },
    { id: 'internet',    name: 'Internet',          icon: '🌐', color: 'bg-purple-100', placeholder: 'e.g. ACC123456' },
    { id: 'phone',       name: 'Phone Top Up',      icon: '📱', color: 'bg-green-100',  placeholder: 'e.g. 012345678' },
    { id: 'tv',          name: 'Cable TV',           icon: '📺', color: 'bg-red-100',    placeholder: 'e.g. TV-001234' },
    { id: 'tax',         name: 'Tax Payment',        icon: '🏛️', color: 'bg-gray-100',   placeholder: 'e.g. TAX-20260001' },
  ];

  constructor(
    private accountApi: AccountApiService,
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
    this.selectedBill = null;
    this.billNumber = '';
    this.amount = 0;
    this.error = '';
    this.success = false;
    this.isSaving = false;
  }

  selectBill(bill: BillType): void {
    this.selectedBill = bill;
    this.step = 2;
  }

  pay(): void {
    if (!this.selectedAccountId || !this.amount || this.amount <= 0) {
      this.error = 'Please select account and enter a valid amount.';
      return;
    }
    this.isSaving = true;
    this.error = '';

    // Deduct from account balance
    this.accountApi.topUp(this.selectedAccountId, -this.amount).subscribe({
      next: () => {
        // Create notification
        this.notificationApi.create({
          title: 'Bill Payment Successful',
          message: `$${this.amount.toFixed(2)} paid to ${this.selectedBill?.name} (${this.billNumber || 'N/A'})`,
          type: 'debit'
        }).subscribe();
        this.isSaving = false;
        this.success = true;
      },
      error: (err) => {
        this.isSaving = false;
        this.error = err?.status === 401 ? 'Session expired.' : 'Payment failed. Check balance.';
      }
    });
  }

  accountName(id: number): string {
    const a = this.accounts.find(x => x.id === id);
    return a ? `${a.name} ($${a.balance})` : '';
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  }
}
