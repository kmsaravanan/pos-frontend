import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import type { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  DashboardService,
  TodaySales,
  InvoiceStats,
  TopProduct,
  CategorySales,
  LowStockProduct
} from '../../core/services/dashboard.service';

const CATEGORY_COLORS = ['#2a5298', '#4fc3f7', '#66bb6a', '#ffa726', '#ef5350', '#ab47bc', '#26a69a', '#8d6e63'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTableModule, MatSortModule, MatPaginatorModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  todaySales: TodaySales | null = null;
  invoiceStats: InvoiceStats | null = null;
  topProducts: TopProduct[] = [];
  lowStockDataSource = new MatTableDataSource<LowStockProduct>([]);
  lowStockTotalElements = 0;
  lowStockPageSize = 10;
  lowStockPageNumber = 0;

  @ViewChild(MatSort) sort!: MatSort;

  lowStockColumns: string[] = ['sku', 'name', 'stockQuantity', 'minStockThreshold'];

  hasTrendData = false;
  hasTopProducts = false;
  hasCategoryData = false;

  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Sales ($)',
      fill: true,
      tension: 0.3,
      borderColor: '#2a5298',
      backgroundColor: 'rgba(42, 82, 152, 0.12)',
      pointBackgroundColor: '#2a5298'
    }]
  };
  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Quantity Sold', backgroundColor: '#2a5298', borderRadius: 4 }]
  };
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
  };

  doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: CATEGORY_COLORS }]
  };
  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  constructor(private dashboardService: DashboardService, private router: Router) {}

  ngOnInit(): void {
    this.dashboardService.getTodaySales().subscribe({
      next: (data) => this.todaySales = data,
      error: (err) => console.error('Failed to load today sales', err)
    });

    this.dashboardService.getInvoiceStats().subscribe({
      next: (data) => this.invoiceStats = data,
      error: (err) => console.error('Failed to load invoice stats', err)
    });

    this.dashboardService.getSalesTrend(30).subscribe({
      next: (points) => {
        this.hasTrendData = points.some(p => p.totalSales > 0);
        this.lineChartData = {
          labels: points.map(p => this.formatShortDate(p.date)),
          datasets: [{ ...this.lineChartData.datasets[0], data: points.map(p => p.totalSales) }]
        };
      },
      error: (err) => console.error('Failed to load sales trend', err)
    });

    this.dashboardService.getTopProducts(30, 5).subscribe({
      next: (products) => {
        this.topProducts = products;
        this.hasTopProducts = products.length > 0;
        this.barChartData = {
          labels: products.map(p => p.productName),
          datasets: [{ ...this.barChartData.datasets[0], data: products.map(p => p.quantitySold) }]
        };
      },
      error: (err) => console.error('Failed to load top products', err)
    });

    this.dashboardService.getSalesByCategory(30).subscribe({
      next: (categories) => {
        this.hasCategoryData = categories.length > 0;
        this.doughnutChartData = {
          labels: categories.map(c => c.categoryName),
          datasets: [{ data: categories.map(c => c.revenue), backgroundColor: CATEGORY_COLORS }]
        };
      },
      error: (err) => console.error('Failed to load sales by category', err)
    });

    this.loadLowStockProducts();
  }

  ngAfterViewInit(): void {
    this.lowStockDataSource.sort = this.sort;
  }

  loadLowStockProducts(): void {
    this.dashboardService.getLowStockProducts(this.lowStockPageNumber, this.lowStockPageSize).subscribe({
      next: (res) => {
        this.lowStockDataSource.data = res.content;
        this.lowStockTotalElements = res.totalElements;
      },
      error: (err) => console.error('Failed to load low stock products', err)
    });
  }

  onLowStockPageChange(event: PageEvent): void {
    this.lowStockPageSize = event.pageSize;
    this.lowStockPageNumber = event.pageIndex;
    this.loadLowStockProducts();
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  private formatShortDate(isoDate: string): string {
    const d = new Date(isoDate);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
}
