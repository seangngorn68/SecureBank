import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardApiService } from '../services/card-api.service';
import { Card } from '../core/models';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cards.component.html'
})
export class CardsComponent implements OnInit {
  cards: Card[] = [];
  isLoading = true;
  error = '';

  // Add card modal
  showModal = false;
  isSaving = false;
  saveError = '';
  newCard = { type: 'Visa Debit', holder: '', expiry: '', balance: 0, creditLimit: null as number | null };

  cardTypes = [
    { value: 'Visa Debit',        label: 'Visa Debit',        icon: '💳', color: 'from-blue-600 to-blue-800' },
    { value: 'Mastercard Credit', label: 'Mastercard Credit', icon: '🔴', color: 'from-gray-800 to-gray-900' },
    { value: 'Visa Credit',       label: 'Visa Credit',       icon: '💜', color: 'from-purple-600 to-purple-800' },
  ];

  constructor(private cardApi: CardApiService) {}

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards(): void {
    this.isLoading = true;
    this.cardApi.getAll().subscribe({
      next: data => { this.cards = data; this.isLoading = false; },
      error: () => { this.error = 'Failed to load cards.'; this.isLoading = false; }
    });
  }

  freezeCard(id: number): void {
    this.cardApi.freeze(id).subscribe({
      next: updated => {
        const idx = this.cards.findIndex(c => c.id === id);
        if (idx !== -1) this.cards[idx] = updated;
      }
    });
  }

  openModal(): void {
    const now = new Date();
    const exp = `${String(now.getMonth() + 1).padStart(2,'0')}/${String(now.getFullYear() + 5).slice(-2)}`;
    this.newCard = { type: 'Visa Debit', holder: '', expiry: exp, balance: 0, creditLimit: null };
    this.saveError = '';
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  isCredit(): boolean {
    return this.newCard.type.toLowerCase().includes('credit');
  }

  saveCard(): void {
    if (!this.newCard.holder.trim()) {
      this.saveError = 'Cardholder name is required.';
      return;
    }
    this.isSaving = true;
    this.saveError = '';

    const last4 = Math.floor(1000 + Math.random() * 9000);
    const prefix = this.newCard.type.startsWith('Visa') ? '4' : '5';

    const payload: Partial<Card> = {
      type: this.newCard.type,
      holder: this.newCard.holder.toUpperCase().trim(),
      expiry: this.newCard.expiry,
      balance: Number(this.newCard.balance) || 0,
      creditLimit: this.isCredit() ? (Number(this.newCard.creditLimit) || 10000) : null,
      cashback: 0,
      status: 'active',
      number: `${prefix}XXX  ****  ****  ${last4}`
    };

    this.cardApi.create(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showModal = false;
        this.loadCards();
      },
      error: (err) => {
        this.isSaving = false;
        this.saveError = err?.status === 401
          ? 'Session expired. Please log in again.'
          : 'Failed to create card. Please try again.';
      }
    });
  }

  gradientFor(index: number): string {
    const g = [
      'bg-gradient-to-br from-blue-600 to-blue-800',
      'bg-gradient-to-br from-gray-800 to-gray-900',
      'bg-gradient-to-br from-purple-600 to-purple-800',
      'bg-gradient-to-br from-green-600 to-green-800'
    ];
    return g[index % g.length];
  }

  fmt(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount ?? 0);
  }
}
