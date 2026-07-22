import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import  {MatDialog}  from '@angular/material/dialog'
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { InvoicePreviewDialogComponent } from '../invoice-preview-dialog/invoice-preview-dialog';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatSnackBarModule
  ],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['invoiceNumber', 'customerName', 'netAmount', 'paymentMethod', 'status', 'createdAt', 'actions'];

  totalElements: number = 0;
  pageSize: number = 10;
  pageNumber: number = 0;
  searchTerm: string = '';
  private searchTimeout: any;

  // Base URL for PDF direct links
  private baseUrl = 'http://localhost:8080/invoicesys/api'; 

  constructor(private api: ApiService, private snackBar: MatSnackBar, private dialog:MatDialog) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    // Note: We are using the standard /invoices endpoint for now. 
    // Spring Boot pagination will be handled here.
    const url = `/invoices?page=${this.pageNumber}&size=${this.pageSize}&search=${this.searchTerm}`;
    
    this.api.getPagated<any>(url).subscribe({
      next: (data: any) => {
        // If backend returns a Page object, it has 'content'. If it returns an array, it doesn't.
        // Once we add pagination to the backend InvoiceController, this will be data.content.
        // For now, assuming backend might return raw array or paged response:
        if (Array.isArray(data)) {
          this.dataSource.data = data;
          this.totalElements = data.length; // Fallback
        } else {
          this.dataSource.data = data.content;
          this.totalElements = data.totalElements;
        }
      },
      error: (err) => console.error('Failed to load invoices', err)
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex;
    this.loadInvoices();
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.pageNumber = 0;
      this.loadInvoices();
    }, 300);
  }

// 1. VIEW INVOICE: Opens the Modal Dialog
  viewInvoice(invoiceNumber: string): void {
    this.dialog.open(InvoicePreviewDialogComponent, {
      width: '80vw',
      height: '90vh',
      data: { invoiceNumber: invoiceNumber }
    });
  }

  // 2. DOWNLOAD INVOICE: Forces the secure file download
  downloadPdf(invoiceNumber: string): void {
    this.api.getPdf(`/invoices/${invoiceNumber}/pdf`).subscribe({
      next: (blob) => {
        const fileURL = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = `${invoiceNumber}.pdf`; // Forces download with filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(fileURL);
      },
      error: (err) => {
        this.snackBar.open('Failed to download PDF.', 'Close', { duration: 3000 });
        console.error(err);
      }
    });
  }
}