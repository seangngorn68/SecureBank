import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, AsyncPipe, RouterModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  @Output() closeSidebar = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    public userService: UserService
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
