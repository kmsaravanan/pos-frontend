import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CompanySettings, SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  company: CompanySettings = { name: '', address: '', phone: '', email: '', gstNumber: '' };
  savingCompany = false;

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  savingPassword = false;

  constructor(private settingsService: SettingsService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.settingsService.getCompanySettings().subscribe({
      next: (data) => this.company = data,
      error: (err) => {
        this.snackBar.open('Failed to load company settings.', 'Close', { duration: 3000 });
        console.error(err);
      }
    });
  }

  saveCompanyDetails(): void {
    this.savingCompany = true;
    this.settingsService.updateCompanySettings(this.company).subscribe({
      next: (data) => {
        this.savingCompany = false;
        this.company = data;
        this.snackBar.open('Company details updated!', 'Close', { duration: 2500 });
      },
      error: (err) => {
        this.savingCompany = false;
        this.snackBar.open('Error: ' + err.error.message, 'Close', { duration: 3000 });
      }
    });
  }

  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.snackBar.open('New password and confirmation do not match.', 'Close', { duration: 3000 });
      return;
    }

    this.savingPassword = true;
    this.settingsService.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.savingPassword = false;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.snackBar.open('Password updated!', 'Close', { duration: 2500 });
      },
      error: (err) => {
        this.savingPassword = false;
        this.snackBar.open('Error: ' + err.error.message, 'Close', { duration: 3000 });
      }
    });
  }
}
