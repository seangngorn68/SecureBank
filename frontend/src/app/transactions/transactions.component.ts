import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionApiService } from '../services/transaction-api.service';
import { AccountApiService } from '../services/account-api.service';
import { ExportService } from '../services/export.service';
import { QrModalComponent } from '../shared/qr-modal/qr-modal.component';
import { PayBillComponent } from '../shared/pay-bill/pay-bill.component';
import { Transaction, Account } from '../core/models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, QrModalComponent, PayBillComponent],
  templateUrl: './transactions.component.html'
})
export class TransactionsComponent implements OnInit {
  searchQuery = '';
  filterType = 'all';
  dateFrom = '';
  dateTo = '';
  allTransactions: Transaction[] = [];
  accounts: Account[] = [];
  isLoading = true;
  error = '';
  showQr = false;
  showPayBill = false;

  // Transfer modal
  showModal = false;
  isSaving = false;
  saveError = '';
  transfer = { fromAccountId: 0, toAccountId: 0, amount: 0, note: '' };

  constructor(
    private transactionApi: TransactionApiService,
    private accountApi: AccountApiService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.load();
    this.accountApi.getAll().subscribe({ next: data => this.accounts = data, error: () => {} });
  }

  load(): void {
    this.isLoading = true;
    this.transactionApi.getAll(this.filterType, this.searchQuery).subscribe({
      next: data => { this.allTransactions = data; this.isLoading = false; },
      error: () => { this.error = 'Failed to load transactions.'; this.isLoading = false; }
    });
  }

  exportCsv(): void {
    const name = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    this.exportService.exportTransactionsCsv(this.filteredTransactions, name);
  }

  exportPdf(): void {
    const name = `statement-${new Date().toISOString().slice(0, 10)}.pdf`;
    this.exportService.exportTransactionsPdf(this.filteredTransactions, name);
  }

  get filteredTransactions(): Transaction[] {
    return this.allTransactions.filter(tx => {
      const q = this.searchQuery.toLowerCase();
      const matchSearch = !q || tx.name.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q);
      const txDate = new Date(tx.date);
      const matchFrom = !this.dateFrom || txDate >= new Date(this.dateFrom);
      const matchTo   = !this.dateTo   || txDate <= new Date(this.dateTo + 'T23:59:59');
      return matchSearch && matchFrom && matchTo;
    });
  }

  clearDates(): void { this.dateFrom = ''; this.dateTo = ''; }

  onFilterChange(): void { this.load(); }

  openModal(): void {
    this.transfer = { fromAccountId: 0, toAccountId: 0, amount: 0, note: '' };
    this.saveError = '';
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  doTransfer(): void {
    if (!this.transfer.fromAccountId || !this.transfer.toAccountId) {
      this.saveError = 'Please select both accounts.';
      return;
    }
    if (this.transfer.fromAccountId === this.transfer.toAccountId) {
      this.saveError = 'From and To accounts must be different.';
      return;
    }
    if (!this.transfer.amount || this.transfer.amount <= 0) {
      this.saveError = 'Please enter a valid amount.';
      return;
    }
    this.isSaving = true;
    this.saveError = '';
    this.transactionApi.transfer(
      this.transfer.fromAccountId,
      this.transfer.toAccountId,
      this.transfer.amount,
      this.transfer.note
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.showModal = false;
        this.load();
      },
      error: (err) => {
        this.isSaving = false;
        this.saveError = err?.status === 401
          ? 'Session expired. Please log in again.'
          : 'Transfer failed. Please try again.';
      }
    });
  }

  accountName(id: number): string {
    return this.accounts.find(a => a.id === id)?.name ?? 'Unknown';
  }

  iconFor(category: string): string {
    const map: Record<string, string> = {
      Income: '💼', Entertainment: '🎬', Food: '🛒',
      Utilities: '⚡', Cash: '🏧', Interest: '💹', Transfer: '🔄'
    };
    return map[category] ?? '💳';
  }

  iconBgFor(type: string): string {
    return type === 'credit' ? 'bg-green-100' : 'bg-yellow-100';
  }

  fmt(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
}
