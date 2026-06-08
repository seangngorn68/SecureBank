import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BakongTransferRequest {
  fromBakongAccountId: string;  // e.g. "012345678@acb"
  toBakongAccountId: string;    // e.g. "098765432@aba"
  amount: number;
  currency: 'USD' | 'KHR';
  description: string;
}

export interface KhqrResponse {
  responseCode: number;
  responseMessage: string;
  data: {
    qr: string;          // base64 QR image
    md5: string;         // transaction hash to verify later
  };
}

@Injectable({ providedIn: 'root' })
export class BakongService {
  private base = `${environment.apiUrl}/api/bakong`;

  constructor(private http: HttpClient) {}

  /** Check if a Bakong account exists (e.g. "012345678@aba") */
  checkAccount(bakongAccountId: string): Observable<{ exists: boolean; message: string }> {
    return this.http.post<any>(`${this.base}/check-account`, { bakongAccountId });
  }

  /** Transfer money via Bakong */
  transfer(req: BakongTransferRequest): Observable<any> {
    return this.http.post(`${this.base}/transfer`, req);
  }

  /** Generate KHQR code for receiving payment */
  generateQr(params: {
    bakongAccountId: string;
    amount?: number;
    currency?: 'USD' | 'KHR';
    billNumber?: string;
  }): Observable<KhqrResponse> {
    return this.http.post<KhqrResponse>(`${this.base}/qr`, params);
  }

  /** Poll transaction status */
  checkStatus(hash: string): Observable<any> {
    return this.http.get(`${this.base}/status/${hash}`);
  }
}
