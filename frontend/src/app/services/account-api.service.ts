import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, AccountSummary } from '../core/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AccountApiService {
  private base = `${environment.apiUrl}/api/accounts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Account[]> {
    return this.http.get<Account[]>(this.base);
  }

  getById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.base}/${id}`);
  }

  getSummary(): Observable<AccountSummary> {
    return this.http.get<AccountSummary>(`${this.base}/summary`);
  }

  create(account: Account): Observable<Account> {
    return this.http.post<Account>(this.base, account);
  }

  topUp(id: number, amount: number): Observable<Account> {
    return this.http.put<Account>(`${this.base}/${id}/balance`, { delta: amount });
  }
}
