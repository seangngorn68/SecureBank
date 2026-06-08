import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card } from '../core/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CardApiService {
  private base = `${environment.apiUrl}/api/cards`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Card[]> {
    return this.http.get<Card[]>(this.base);
  }

  getById(id: number): Observable<Card> {
    return this.http.get<Card>(`${this.base}/${id}`);
  }

  freeze(id: number): Observable<Card> {
    return this.http.patch<Card>(`${this.base}/${id}/freeze`, {});
  }

  create(card: Partial<Card>): Observable<Card> {
    return this.http.post<Card>(this.base, card);
  }
}
