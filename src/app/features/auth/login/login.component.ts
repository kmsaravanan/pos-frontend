import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <div class="login-brand">
          <div class="login-avatar">
            <mat-icon>storefront</mat-icon>
          </div>
          <h1 class="login-title">POS System</h1>
          <p class="login-subtitle">Sign in to continue</p>
        </div>

        <form class="login-form" (ngSubmit)="onLogin()" #loginForm="ngForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Username</mat-label>
            <mat-icon matPrefix>person_outline</mat-icon>
            <input matInput [(ngModel)]="username" name="username" required autocomplete="username">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <mat-icon matPrefix>lock_outline</mat-icon>
            <input matInput [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" required autocomplete="current-password">
            <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword" [attr.aria-label]="'Toggle password visibility'">
              <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <div class="login-error" *ngIf="error">
            <mat-icon>error_outline</mat-icon>
            <span>{{ error }}</span>
          </div>

          <button mat-raised-button color="primary" type="submit" class="full-width login-submit" [disabled]="loginForm.invalid || loading">
            <mat-spinner *ngIf="loading" diameter="20" class="login-spinner"></mat-spinner>
            <span *ngIf="!loading">Login</span>
          </button>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      padding: 16px;
      box-sizing: border-box;
    }

    .login-card {
      width: 100%;
      max-width: 380px;
      padding: 32px 28px;
      border-radius: 16px;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
    }

    .login-brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 24px;
      text-align: center;
    }

    .login-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }

    .login-avatar mat-icon {
      color: #fff;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .login-title {
      margin: 0;
      font-size: 22px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }

    .login-subtitle {
      margin: 4px 0 0;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }

    .login-form {
      display: flex;
      flex-direction: column;
    }

    .full-width {
      width: 100%;
    }

    .login-error {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fdecea;
      color: #b3261e;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 12px;
      font-size: 13px;
    }

    .login-error mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .login-submit {
      height: 44px;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-spinner {
      display: inline-block;
    }
  `]
})
export class LoginComponent {
  username = 'admin';
  password = 'admin123';
  error = '';
  loading = false;
  showPassword = false;

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  onLogin() {
    this.error = '';
    this.loading = true;

    // Clear any old/stale tokens before attempting a new login
    this.auth.logout();

    this.api.post<{ token: string }>('/auth/login', { username: this.username, password: this.password })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.auth.login(res.token);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Invalid username or password';
        }
      });
  }
}