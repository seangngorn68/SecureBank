import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KhqrService } from '../../services/khqr.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-qr-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qr-modal.component.html'
})
export class QrModalComponent implements OnChanges {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();

  bakongId = '';
  amount: number | null = null;
  currency: 'USD' | 'KHR' = 'USD';
  note = '';

  qrDataUrl = '';
  isGenerating = false;
  generated = false;
  copied = false;

  constructor(
    private khqr: KhqrService,
    public userService: UserService
  ) {}

  ngOnChanges(): void {
    if (this.show) {
      this.reset();
    }
  }

  reset(): void {
    this.qrDataUrl = '';
    this.generated = false;
    this.copied = false;
    this.amount = null;
    this.note = '';
    this.currency = 'USD';
  }

  async generate(): Promise<void> {
    if (!this.bakongId.trim()) return;
    this.isGenerating = true;
    try {
      this.qrDataUrl = await this.khqr.generateQrDataUrl({
        bakongId: this.bakongId.trim(),
        merchantName: this.userService.displayName,
        amount: this.amount ?? undefined,
        currency: this.currency,
        billNumber: this.note || `INV-${Date.now()}`,
        note: this.note
      });
      this.generated = true;
    } finally {
      this.isGenerating = false;
    }
  }

  copyId(): void {
    navigator.clipboard.writeText(this.bakongId).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }

  downloadQr(): void {
    const a = document.createElement('a');
    a.href = this.qrDataUrl;
    a.download = `securebank-khqr-${Date.now()}.png`;
    a.click();
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  }
}
