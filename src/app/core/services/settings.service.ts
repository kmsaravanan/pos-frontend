import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  constructor(private api: ApiService) {}

  getCompanySettings(): Observable<CompanySettings> {
    return this.api.get<CompanySettings>('/settings/company');
  }

  updateCompanySettings(payload: CompanySettings): Observable<CompanySettings> {
    return this.api.put<CompanySettings>('/settings/company', payload);
  }

  changePassword(payload: ChangePasswordPayload): Observable<void> {
    return this.api.put<void>('/settings/password', payload);
  }
}
