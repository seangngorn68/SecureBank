import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { AccountsComponent } from './accounts/accounts.component';
import { CardsComponent } from './cards/cards.component';
import { ProfileComponent } from './profile/profile.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { SavingsComponent } from './savings/savings.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'transactions', component: TransactionsComponent },
      { path: 'accounts', component: AccountsComponent },
      { path: 'cards', component: CardsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'savings', component: SavingsComponent },
      { path: 'notifications', component: NotificationsComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
