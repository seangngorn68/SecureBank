import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkKey = 'securebank_dark';
  private dark$ = new BehaviorSubject<boolean>(this.getSaved());

  isDark$ = this.dark$.asObservable();

  get isDark(): boolean { return this.dark$.value; }

  toggle(): void {
    const next = !this.dark$.value;
    this.dark$.next(next);
    localStorage.setItem(this.darkKey, String(next));
    this.apply(next);
  }

  init(): void { this.apply(this.dark$.value); }

  private getSaved(): boolean {
    return localStorage.getItem(this.darkKey) === 'true';
  }

  private apply(dark: boolean): void {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
