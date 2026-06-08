import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CurrentUser {
  userId: string;
  username: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiUrl}/api/auth/me`;
  private userSubject = new BehaviorSubject<CurrentUser | null>(null);
  currentUser$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  load() {
    return this.http.get<CurrentUser>(this.base).pipe(
      tap(user => this.userSubject.next(user))
    );
  }

  get currentUser(): CurrentUser | null {
    return this.userSubject.value;
  }

  get displayName(): string {
    const u = this.userSubject.value;
    if (!u) return 'User';
    // Capitalize first letter of username
    return u.username.charAt(0).toUpperCase() + u.username.slice(1);
  }

  get initials(): string {
    const name = this.displayName;
    const parts = name.split(/[\s_.-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }
}
