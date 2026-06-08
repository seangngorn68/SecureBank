import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html'
})
export class SignupComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSignup() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.username, this.email, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Registration failed. Please try again.';
      }
    });
  }
}
