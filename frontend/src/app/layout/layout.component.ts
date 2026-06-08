import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../shared/header/header.component';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit {
  sidebarOpen = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.load().subscribe();
  }
}
