import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  infoMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['expired']) {
        this.infoMessage = 'Your session expired. Please log in again.';
      }
    });
  }

  onLogin() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter username and password.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/app/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.status === 401
          ? 'Invalid username or password.'
          : `Login failed. Please try again.`;
      }
    });
  }
}
