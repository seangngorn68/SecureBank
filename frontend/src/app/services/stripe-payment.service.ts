import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

@Injectable({ providedIn: 'root' })
export class StripePaymentService {
  private base = `${environment.apiUrl}/api/stripe`;
  private stripePromise: Promise<Stripe | null> | null = null;

  constructor(private http: HttpClient) {}

  async getStripe(): Promise<Stripe | null> {
    if (!this.stripePromise) {
      // Get publishable key from backend
      const config: any = await this.http.get(`${this.base}/config`).toPromise();
      this.stripePromise = loadStripe(config.publishableKey);
    }
    return this.stripePromise;
  }

  createPaymentIntent(amount: number, accountId: number): Observable<{ clientSecret: string; paymentIntentId: string }> {
    return this.http.post<any>(`${this.base}/create-intent`, { amount, accountId });
  }

  confirmDeposit(paymentIntentId: string, accountId: number, amount: number): Observable<any> {
    return this.http.post(`${this.base}/confirm-deposit`, { paymentIntentId, accountId, amount });
  }
}
