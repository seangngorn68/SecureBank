import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SavingsGoalService, SavingsGoal } from '../services/savings-goal.service';

const ICONS = ['🏠','🚗','✈️','📱','🎓','💍','🏖️','🏋️','🐶','🎸','💻','🛒','🌿','⛵','🎮'];
const COLORS = [
  { label: 'Blue',   from: 'from-blue-500',   to: 'to-blue-700',   hex: '#3b82f6' },
  { label: 'Green',  from: 'from-green-500',  to: 'to-green-700',  hex: '#22c55e' },
  { label: 'Purple', from: 'from-purple-500', to: 'to-purple-700', hex: '#a855f7' },
  { label: 'Pink',   from: 'from-pink-500',   to: 'to-pink-700',   hex: '#ec4899' },
  { label: 'Orange', from: 'from-orange-400', to: 'to-orange-600', hex: '#f97316' },
];

@Component({
  selector: 'app-savings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './savings.component.html'
})
export class SavingsComponent implements OnInit {
  goals: SavingsGoal[] = [];
  icons = ICONS;
  colors = COLORS;

  showAdd = false;
  depositGoalId: string | null = null;
  depositAmount = 0;
  depositError = '';

  form = {
    name: '',
    icon: '🏠',
    target: 0,
    saved: 0,
    color: 'from-blue-500 to-blue-700',
    deadline: ''
  };
  formError = '';

  constructor(private goalService: SavingsGoalService) {}

  ngOnInit(): void {
    this.goalService.goals.subscribe(g => this.goals = g);
  }

  progress(goal: SavingsGoal): number {
    return goal.target > 0 ? Math.min((goal.saved / goal.target) * 100, 100) : 0;
  }

  remaining(goal: SavingsGoal): number {
    return Math.max(goal.target - goal.saved, 0);
  }

  daysLeft(deadline?: string): number | null {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.max(Math.ceil(diff / 86400000), 0);
  }

  addGoal(): void {
    if (!this.form.name.trim() || this.form.target <= 0) {
      this.formError = 'Name and a positive target amount are required.';
      return;
    }
    this.goalService.add({ ...this.form });
    this.showAdd = false;
    this.resetForm();
  }

  openDeposit(id: string): void {
    this.depositGoalId = id;
    this.depositAmount = 0;
    this.depositError = '';
  }

  confirmDeposit(): void {
    if (!this.depositGoalId || this.depositAmount <= 0) {
      this.depositError = 'Enter a positive amount.';
      return;
    }
    this.goalService.deposit(this.depositGoalId, this.depositAmount);
    this.depositGoalId = null;
  }

  deleteGoal(id: string): void {
    this.goalService.delete(id);
  }

  private resetForm(): void {
    this.form = { name: '', icon: '🏠', target: 0, saved: 0, color: 'from-blue-500 to-blue-700', deadline: '' };
    this.formError = '';
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  }
}
