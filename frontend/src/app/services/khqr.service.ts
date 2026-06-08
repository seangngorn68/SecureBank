import { Injectable } from '@angular/core';
import QRCode from 'qrcode';

export interface KhqrData {
  bakongId: string;
  merchantName: string;
  amount?: number;
  currency?: 'USD' | 'KHR';
  billNumber?: string;
  note?: string;
}

@Injectable({ providedIn: 'root' })
export class KhqrService {

  buildKhqrString(data: KhqrData): string {
    const currency = data.currency === 'KHR' ? '116' : '840';
    const merchantName = this.sanitize(data.merchantName || 'SecureBank', 25);
    const city         = this.sanitize('Phnom Penh', 15);
    const bakongId     = data.bakongId.trim();

    // ── Build EMV payload ──────────────────────────────────
    let payload = '';
    payload += this.tlv('00', '01');                         // Payload Format Indicator
    payload += this.tlv('01', data.amount ? '12' : '11');   // Initiation Method

    // Merchant Account Info (tag 29 = KHQR / BAKONG)
    const merchantInfo = this.tlv('00', 'bakong.nbc.gov.kh')
                       + this.tlv('01', bakongId);
    payload += this.tlv('29', merchantInfo);

    payload += this.tlv('52', '0000');                       // Merchant Category Code
    payload += this.tlv('53', currency);                     // Currency

    if (data.amount && data.amount > 0) {
      payload += this.tlv('54', data.amount.toFixed(2));     // Amount
    }

    payload += this.tlv('58', 'KH');                         // Country
    payload += this.tlv('59', merchantName);                  // Merchant Name
    payload += this.tlv('60', city);                          // Merchant City

    // Additional Data (bill number)
    if (data.billNumber) {
      const bill = data.billNumber.substring(0, 25);
      payload += this.tlv('62', this.tlv('01', bill));
    }

    // CRC placeholder — must be included before computing CRC
    payload += '6304';
    payload += this.crc16(payload);

    return payload;
  }

  async generateQrDataUrl(data: KhqrData): Promise<string> {
    const qrString = this.buildKhqrString(data);
    console.log('KHQR String:', qrString);  // debug
    return QRCode.toDataURL(qrString, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M'
    });
  }

  // ── TLV helper ─────────────────────────────────────────────
  private tlv(tag: string, value: string): string {
    const len = value.length.toString().padStart(2, '0');
    return `${tag}${len}${value}`;
  }

  // ── Sanitize: letters, digits, spaces only ──────────────────
  private sanitize(str: string, max: number): string {
    return str.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, max);
  }

  // ── CRC-16/CCITT (XMODEM) — correct 16-bit masking ─────────
  private crc16(str: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= (str.charCodeAt(i) << 8);
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = ((crc << 1) ^ 0x1021) & 0xFFFF;  // ← mask to 16-bit
        } else {
          crc = (crc << 1) & 0xFFFF;               // ← mask to 16-bit
        }
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
}
