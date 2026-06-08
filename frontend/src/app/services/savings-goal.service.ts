import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SavingsGoal {
  id: string;
  name: string;
  icon: string;
  target: number;
  saved: number;
  color: string;
  deadline?: string;
}

@Injectable({ providedIn: 'root' })
export class SavingsGoalService {
  private key = 'securebank_goals';
  private goals$ = new BehaviorSubject<SavingsGoal[]>(this.load());

  goals = this.goals$.asObservable();

  getAll(): SavingsGoal[] { return this.goals$.value; }

  add(goal: Omit<SavingsGoal, 'id'>): void {
    const all = [...this.goals$.value, { ...goal, id: Date.now().toString() }];
    this.save(all);
  }

  deposit(id: string, amount: number): void {
    const all = this.goals$.value.map(g =>
      g.id === id ? { ...g, saved: Math.min(g.saved + amount, g.target) } : g
    );
    this.save(all);
  }

  delete(id: string): void {
    this.save(this.goals$.value.filter(g => g.id !== id));
  }

  private save(goals: SavingsGoal[]): void {
    localStorage.setItem(this.key, JSON.stringify(goals));
    this.goals$.next(goals);
  }

  private load(): SavingsGoal[] {
    try {
      return JSON.parse(localStorage.getItem(this.key) || '[]');
    } catch { return []; }
  }
}
