import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Make sure this matches your Spring Boot context path!
  private baseUrl = 'http://localhost:8080/invoicesys/api'; 

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`);
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body);
  }

    // Special method for paginated endpoints
  getPagated<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`);
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body);
  }

  // Special method for PDF blob
  getPdf(endpoint: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${endpoint}`, { responseType: 'blob' });
  }

  searchCustomers(phone: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/customers/search?phone=${phone}`);
  }
}