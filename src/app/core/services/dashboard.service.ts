import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface TodaySales {
  totalSales: number;
  invoiceCount: number;
  paidCount: number;
  pendingCount: number;
}

export interface InvoiceStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalOutstanding: number;
}

export interface SalesTrendPoint {
  date: string;
  totalSales: number;
  invoiceCount: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  sku: string;
  quantitySold: number;
  revenue: number;
}

export interface CategorySales {
  categoryName: string;
  revenue: number;
  quantitySold: number;
}

export interface LowStockProduct {
  id: number;
  sku: string;
  name: string;
  stockQuantity: number;
  minStockThreshold: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private api: ApiService) {}

  getTodaySales(): Observable<TodaySales> {
    return this.api.get<TodaySales>('/dashboard/today-sales');
  }

  getInvoiceStats(): Observable<InvoiceStats> {
    return this.api.get<InvoiceStats>('/dashboard/invoice-stats');
  }

  getSalesTrend(days: number = 30): Observable<SalesTrendPoint[]> {
    return this.api.get<SalesTrendPoint[]>(`/dashboard/sales-trend?days=${days}`);
  }

  getTopProducts(days: number = 30, limit: number = 5): Observable<TopProduct[]> {
    return this.api.get<TopProduct[]>(`/dashboard/top-products?days=${days}&limit=${limit}`);
  }

  getSalesByCategory(days: number = 30): Observable<CategorySales[]> {
    return this.api.get<CategorySales[]>(`/dashboard/sales-by-category?days=${days}`);
  }

  getLowStockProducts(): Observable<LowStockProduct[]> {
    return this.api.get<LowStockProduct[]>('/dashboard/low-stock');
  }
}
