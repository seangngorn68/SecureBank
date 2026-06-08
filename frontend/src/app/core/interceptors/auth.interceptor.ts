import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const stored = localStorage.getItem('banking_auth');

  if (stored) {
    const auth = JSON.parse(stored);
    if (auth.token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${auth.token}` }
      });
    }
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // Token expired or invalid — clear session and redirect to login
        localStorage.removeItem('banking_auth');
        router.navigate(['/login'], { queryParams: { expired: true } });
      }
      return throwError(() => err);
    })
  );
};
