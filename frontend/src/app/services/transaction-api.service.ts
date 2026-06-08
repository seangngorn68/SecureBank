import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../core/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransactionApiService {
  private base = `${environment.apiUrl}/api/transactions`;

  constructor(private http: HttpClient) {}

  getAll(type = 'all', search = ''): Observable<Transaction[]> {
    const params = new HttpParams().set('type', type).set('search', search);
    return this.http.get<Transaction[]>(this.base, { params });
  }

  getRecent(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.base}/recent`);
  }

  transfer(fromAccountId: number, toAccountId: number, amount: number, note: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.base}/transfer`, { fromAccountId, toAccountId, amount, note });
  }

  sendMoney(fromAccountId: number, toAccountNumber: string, amount: number, note: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.base}/send`, { fromAccountId, toAccountNumber, amount, note });
  }

  getMonthlySummary(): Observable<{ monthlyIncome: number; monthlyExpenses: number; year: number; month: number }> {
    return this.http.get<any>(`${this.base}/monthly-summary`);
  }
}
