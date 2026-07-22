import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog'; // Import MatDialog
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { AddProductDialogComponent } from '../add-product-dialog/add-product-dialog'; // Import Dialog

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule, 
    MatCardModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, 
    MatDialogModule, MatSnackBarModule // Added MatDialog & SnackBar
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['sku', 'name', 'category', 'price', 'gstPercentage', 'stockQuantity', 'actions'];

  totalElements: number = 0;
  pageSize: number = 10;
  pageNumber: number = 0;
  
  searchTerm: string = '';
  private searchTimeout: any;

  constructor(
    private api: ApiService, 
    private dialog: MatDialog, // Inject MatDialog
    private snackBar: MatSnackBar // Inject SnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    const url = `/products?page=${Number(this.pageNumber)}&size=${Number(this.pageSize)}&search=${this.searchTerm}`;
    this.api.getPagated<any>(url).subscribe({
      next: (data: any) => {
        this.dataSource.data = data.content;
        this.totalElements = data.totalElements;
      },
      error: (err) => console.error('Failed to load products', err)
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex;
    this.loadProducts();
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.pageNumber = 0; 
      this.loadProducts();
    }, 300);
  }

  // NEW: Open Add Product Dialog
  openAddProductDialog(): void {
    const dialogRef = this.dialog.open(AddProductDialogComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // User clicked Save, send to backend
        this.api.post('/products', result).subscribe({
          next: () => {
            this.snackBar.open('Product added successfully!', 'Close', { duration: 2000 });
            this.loadProducts(); // Refresh table
          },
          error: (err) => {
            this.snackBar.open('Error: ' + err.error.message, 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  // NEW: Edit Price inline prompt
  editPrice(product: any): void {
    const newPriceStr = prompt(`Edit price for ${product.name}:`, product.price);
    if (newPriceStr !== null) {
      const newPrice = parseFloat(newPriceStr);
      if (!isNaN(newPrice) && newPrice >= 0) {
        // We need an update endpoint in Spring Boot for this, 
        // but we can use the adjust-stock logic approach if we don't have one.
        // For now, let's assume we send a PATCH request
        this.api.post(`/products/${product.id}/update-price`, { price: newPrice }).subscribe({
          next: () => {
            this.snackBar.open('Price updated!', 'Close', { duration: 2000 });
            this.loadProducts();
          },
          error: (err) => {
            this.snackBar.open('Error: ' + err.error.message, 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  // NEW: Edit low-stock threshold inline prompt
  editMinStockThreshold(product: any): void {
    const newThresholdStr = prompt(`Edit low-stock threshold for ${product.name}:`, product.minStockThreshold);
    if (newThresholdStr !== null) {
      const newThreshold = parseInt(newThresholdStr, 10);
      if (!isNaN(newThreshold) && newThreshold >= 0) {
        this.api.post(`/products/${product.id}/update-threshold`, { minStockThreshold: newThreshold }).subscribe({
          next: () => {
            this.snackBar.open('Low-stock threshold updated!', 'Close', { duration: 2000 });
            this.loadProducts();
          },
          error: (err) => {
            this.snackBar.open('Error: ' + err.error.message, 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  adjustStock(productId: number): void {
    const qtyStr = prompt('Enter quantity change (e.g., 10 for restock, -5 for damaged):');
    if (qtyStr !== null) {
      const qty = parseInt(qtyStr);
      if (!isNaN(qty)) {
        const type = qty > 0 ? 'RESTOCK' : 'DAMAGED';
        this.api.post('/products/adjust-stock', {
          productId: productId,
          quantityChanged: qty,
          movementType: type,
          reason: 'Adjusted via POS UI'
        }).subscribe({
          next: () => this.loadProducts(),
          error: (err) => alert('Error adjusting stock: ' + err.error.message)
        });
      }
    }
  }
}