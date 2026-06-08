import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Transaction } from '../core/models';

@Injectable({ providedIn: 'root' })
export class ExportService {

  exportTransactionsPdf(transactions: Transaction[], filename = 'bank-statement.pdf'): void {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    // Header bar
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageW, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SecureBank', 14, 13);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Bank Statement', 14, 20);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 26);

    // Summary totals
    const income  = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    const fmt = (n: number) => '$' + n.toFixed(2);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(9);
    let y = 42;
    doc.setFont('helvetica', 'bold');
    doc.text('Total Income:', 14, y);   doc.setFont('helvetica', 'normal'); doc.setTextColor(22, 163, 74);  doc.text(fmt(income), 55, y);
    doc.setTextColor(30, 30, 30);       doc.setFont('helvetica', 'bold');
    doc.text('Total Expenses:', 90, y); doc.setFont('helvetica', 'normal'); doc.setTextColor(220, 38, 38);  doc.text(fmt(expense), 132, y);
    doc.setTextColor(30, 30, 30);       doc.setFont('helvetica', 'bold');
    doc.text('Net:', 165, y);           doc.setFont('helvetica', 'normal');
    const net = income - expense;
    doc.setTextColor(net >= 0 ? 22 : 220, net >= 0 ? 163 : 38, net >= 0 ? 74 : 38);
    doc.text(fmt(net), 175, y);

    // Column headers
    y = 54;
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(71, 85, 105);
    doc.rect(14, y - 5, pageW - 28, 8, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Date',      16,  y);
    doc.text('Name',      46,  y);
    doc.text('Category',  105, y);
    doc.text('Type',      138, y);
    doc.text('Amount',    163, y);
    doc.text('Status',    185, y);

    // Rows
    y += 8;
    doc.setFont('helvetica', 'normal');
    let rowAlt = false;
    for (const t of transactions) {
      if (y > 270) { doc.addPage(); y = 20; }
      if (rowAlt) { doc.setFillColor(248, 250, 252); doc.rect(14, y - 4, pageW - 28, 7, 'F'); }
      rowAlt = !rowAlt;

      doc.setTextColor(80, 80, 80);
      doc.setFontSize(7.5);
      doc.text(new Date(t.date).toLocaleDateString('en-US'), 16, y);
      doc.text(t.name.length > 28 ? t.name.slice(0, 25) + '...' : t.name, 46, y);
      doc.text(t.category, 105, y);
      doc.setTextColor(t.type === 'credit' ? 22 : 220, t.type === 'credit' ? 163 : 38, t.type === 'credit' ? 74 : 38);
      doc.text(t.type === 'credit' ? 'Income' : 'Expense', 138, y);
      doc.text((t.type === 'credit' ? '+' : '-') + fmt(t.amount), 163, y);
      doc.setTextColor(80, 80, 80);
      doc.text(t.status, 185, y);
      y += 7;
    }

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text('SecureBank — Confidential Statement', 14, 287);
    doc.text(`${transactions.length} transaction(s)`, pageW - 14, 287, { align: 'right' });

    doc.save(filename);
  }

  exportTransactionsCsv(transactions: Transaction[], filename = 'transactions.csv'): void {
    const headers = ['Date', 'Name', 'Category', 'Type', 'Amount (USD)', 'Status'];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString('en-US'),
      `"${t.name}"`,
      t.category,
      t.type === 'credit' ? 'Income' : 'Expense',
      (t.type === 'credit' ? '+' : '-') + Number(t.amount).toFixed(2),
      t.status
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
