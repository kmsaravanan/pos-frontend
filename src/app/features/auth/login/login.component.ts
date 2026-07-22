import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="login-container" fxLayoutAlign="center center">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title><h2>POS System Login</h2></mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onLogin()">
            <mat-form-field appearance="fill" style="width: 100%">
              <mat-label>Username</mat-label>
              <input matInput [(ngModel)]="username" name="username" required>
            </mat-form-field>
            <mat-form-field appearance="fill" style="width: 100%">
              <mat-label>Password</mat-label>
              <input matInput type="password" [(ngModel)]="password" name="password" required>
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" style="width: 100%">
              Login
            </button>
            <p *ngIf="error" style="color: red; margin-top: 10px;">{{ error }}</p>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container { height: 100vh; display: flex; justify-content: center; align-items: center; background: #f5f5f5; }
    .login-card { width: 350px; }
  `]
})
export class LoginComponent {
  username = 'admin';
  password = 'admin123';
  error = '';

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  onLogin() {
    // Clear any old/stale tokens before attempting a new login
    this.auth.logout(); 

    this.api.post<{ token: string }>('/auth/login', { username: this.username, password: this.password })
      .subscribe({
        next: (res) => {
          this.auth.login(res.token);
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.error = 'Invalid username or password';
        }
      });
  }
}