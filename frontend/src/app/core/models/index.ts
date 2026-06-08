export interface LoginRequest { username: string; password: string; }
export interface RegisterRequest { username: string; email: string; password: string; }
export interface AuthResponse { access_token: string; token_type: string; expires_in: number; }

export interface Account {
  id: number;
  userId: string;
  name: string;
  number: string;
  balance: number;
  type: string;
  interestRate: string;
}

export interface AccountSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  incomeChange: string;
  expenseChange: string;
  savingsChange: string;
}

export interface Transaction {
  id: number;
  userId: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
  status: string;
}

export interface Card {
  id: number;
  userId: string;
  type: string;
  number: string;
  holder: string;
  expiry: string;
  balance: number;
  creditLimit: number | null;
  cashback: number;
  status: string;
}

export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;      // Java serializes boolean isRead → "read"
  createdAt: string;
}
