import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  features = [
    { icon: '🔒', title: 'Bank-Grade Security', desc: 'Your money is protected with 256-bit encryption and multi-factor authentication.' },
    { icon: '⚡', title: 'Instant Transfers', desc: 'Send money to anyone, anywhere in seconds with zero fees between accounts.' },
    { icon: '📊', title: 'Smart Analytics', desc: 'Track your spending, set budgets, and grow your savings with AI insights.' },
    { icon: '🌍', title: 'Global Access', desc: 'Access your accounts 24/7 from anywhere in the world on any device.' },
    { icon: '💳', title: 'Virtual Cards', desc: 'Create instant virtual cards for online shopping with full spending control.' },
    { icon: '🤝', title: 'Live Support', desc: 'Our team is available 24/7 to help you with any questions or issues.' },
  ];

  stats = [
    { value: '2M+', label: 'Happy Customers' },
    { value: '$50B+', label: 'Transactions Processed' },
    { value: '99.9%', label: 'Uptime Guaranteed' },
    { value: '150+', label: 'Countries Supported' },
  ];
}
