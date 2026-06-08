import {
  Component, Input, Output, EventEmitter,
  OnChanges, OnDestroy, ElementRef, ViewChild, AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StripePaymentService } from '../../services/stripe-payment.service';
import { AccountApiService } from '../../services/account-api.service';
import { NotificationApiService } from '../../services/notification-api.service';
import { Account } from '../../core/models';
import { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-stripe-deposit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stripe-deposit.component.html'
})
export class StripeDepositComponent implements OnChanges, OnDestroy, AfterViewChecked {

  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() deposited = new EventEmitter<number>();

  @ViewChild('cardElement') cardElementRef?: ElementRef;

  accounts: Account[] = [];
  selectedAccountId = 0;
  amount = 0;

  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  card: StripeCardElement | null = null;
  cardMounted = false;
  cardReady = false;
  isPaying = false;  // ← shows spinner WITHOUT removing card from DOM

  step: 'form' | 'success' | 'error' = 'form';  // removed 'processing'
  errorMsg = '';
  successAmount = 0;

  constructor(
    private stripeService: StripePaymentService,
    private accountApi: AccountApiService,
    private notifApi: NotificationApiService
  ) {}

  async ngOnChanges() {
    if (this.show) {
      this.reset();
      this.accountApi.getAll().subscribe(a => this.accounts = a);
      this.stripe = await this.stripeService.getStripe();
    } else {
      this.destroyCard();
    }
  }

  /** Mount card once the #cardElement div is in DOM */
  ngAfterViewChecked() {
    if (this.show && this.step === 'form' && !this.cardMounted
        && this.cardElementRef?.nativeElement && this.stripe) {
      this.mountCard();
    }
  }

  mountCard() {
    if (!this.stripe || !this.cardElementRef?.nativeElement) return;
    this.destroyCard();

    this.elements = this.stripe.elements();
    this.card = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#1f2937',
          fontFamily: 'Inter, sans-serif',
          '::placeholder': { color: '#9ca3af' }
        },
        invalid: { color: '#ef4444' }
      }
    });

    this.card.mount(this.cardElementRef.nativeElement);
    this.cardMounted = true;

    this.card.on('ready', () => { this.cardReady = true; });
    this.card.on('change', (e) => { this.errorMsg = e.error?.message ?? ''; });
  }

  destroyCard() {
    if (this.card) { this.card.destroy(); this.card = null; }
    this.cardMounted = false;
    this.cardReady = false;
  }

  reset() {
    this.step = 'form';
    this.errorMsg = '';
    this.amount = 0;
    this.selectedAccountId = 0;
    this.successAmount = 0;
    this.isPaying = false;
    this.cardMounted = false;
    this.cardReady = false;
  }

  async pay() {
    if (!this.stripe || !this.card) {
      this.errorMsg = 'Card not loaded. Please wait.'; return;
    }
    if (!this.cardReady) {
      this.errorMsg = 'Card is still loading. Please wait.'; return;
    }
    if (!this.selectedAccountId) { this.errorMsg = 'Please select an account.'; return; }
    if (!this.amount || this.amount < 1) { this.errorMsg = 'Minimum $1.'; return; }

    this.isPaying = true;   // ← show spinner, keep card in DOM
    this.errorMsg = '';

    try {
      // 1. Create PaymentIntent
      const intent = await this.stripeService
        .createPaymentIntent(this.amount, this.selectedAccountId)
        .toPromise();

      // 2. Confirm card — card element STILL IN DOM (step is still 'form')
      const result = await this.stripe.confirmCardPayment(intent!.clientSecret, {
        payment_method: { card: this.card }
      });

      if (result.error) {
        this.isPaying = false;
        this.step = 'error';
        this.errorMsg = result.error.message || 'Card declined.';
        return;
      }

      if (result.paymentIntent?.status !== 'succeeded') {
        this.isPaying = false;
        this.step = 'error';
        this.errorMsg = `Payment status: ${result.paymentIntent?.status}`;
        return;
      }

      // 3. Confirm on backend
      await this.stripeService
        .confirmDeposit(intent!.paymentIntentId, this.selectedAccountId, this.amount)
        .toPromise();

      // 4. Notification
      await this.notifApi.create({
        title: '💳 Card Deposit Successful',
        message: `$${this.amount.toFixed(2)} deposited via Stripe card.`,
        type: 'credit'
      }).toPromise();

      this.successAmount = this.amount;
      this.isPaying = false;
      this.step = 'success';   // ← only NOW change step (card no longer needed)
      this.deposited.emit(this.amount);

    } catch (err: any) {
      this.isPaying = false;
      this.step = 'error';
      this.errorMsg = err?.error?.error || err?.message || 'Payment failed.';
    }
  }

  ngOnDestroy() { this.destroyCard(); }

  accountName(id: number): string {
    return this.accounts.find(a => a.id === id)?.name ?? '';
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  }
}
