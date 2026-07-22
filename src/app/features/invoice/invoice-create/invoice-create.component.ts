import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {InvoicePreviewDialogComponent} from '../invoice-preview-dialog/invoice-preview-dialog'
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment'; // Import environment

@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule,
    MatDialogModule, MatTooltipModule // <-- Make sure MatDialogModule is here

  ],
  templateUrl: './invoice-create.html',
  styleUrls: ['./invoice-create.scss']
})
export class InvoiceCreateComponent {
  // Expose the environment variable to the HTML template
  isGstEnabled: boolean = environment.gstEnabled;

  // Discount field is hidden for now; flip to true to bring it back
  showDiscountField: boolean = false;

  searchDataSource = new MatTableDataSource<any>([]);
  cartDataSource = new MatTableDataSource<any>([]);
  
  searchColumns: string[] = ['sku', 'name', 'price', 'stock', 'action'];
  cartColumns: string[] = ['name', 'price', 'quantity', 'total', 'action'];

  searchTerm: string = '';
  private searchTimeout: any;
    customerPhone: string = '';
  isExistingCustomer: boolean = false;
  private phoneSearchTimeout: any;
  
  cartItems: any[] = [];
  discount: number = 0;
  subTotal: number = 0;
  totalGst: number = 0;
  netAmount: number = 0;

  customerName: string = 'Walk-in Customer';
  paymentMethod: string = 'CASH';

  constructor(private api: ApiService, private snackBar: MatSnackBar,    private dialog: MatDialog // <-- Inject MatDialog here
) {}

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    if (this.searchTerm.trim().length < 2) { 
      this.searchDataSource.data = [];
      return;
    }
    this.searchTimeout = setTimeout(() => {
      this.api.getPagated<any>(`/products?page=0&size=10&search=${this.searchTerm}`).subscribe({
        next: (data) => this.searchDataSource.data = data.content,
        error: (err) => console.error(err)
      });
    }, 300);
  }

  // Remaining stock for a product, accounting for quantity already added to the cart
  getAvailableStock(product: any): number {
    const existingItem = this.cartItems.find(item => item.productId === product.id);
    const usedQty = existingItem ? existingItem.quantity : 0;
    return product.stockQuantity - usedQty;
  }

  addToCart(product: any): void {
    if (this.getAvailableStock(product) <= 0) {
      this.snackBar.open(`${product.name} is out of stock!`, 'Close', { duration: 2500 });
      return;
    }

    const existingItem = this.cartItems.find(item => item.productId === product.id);
    if (existingItem) {
      existingItem.quantity++;
      existingItem.totalPrice = existingItem.price * existingItem.quantity;
    } else {
      this.cartItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        gstPercentage: product.gstPercentage,
        stockQuantity: product.stockQuantity,
        quantity: 1,
        totalPrice: product.price
      });
    }
    this.refreshCart();
  }

  changeQty(item: any, change: number): void {
    if (change > 0 && item.quantity >= item.stockQuantity) {
      this.snackBar.open(`Only ${item.stockQuantity} unit(s) of ${item.productName} in stock!`, 'Close', { duration: 2500 });
      return;
    }

    item.quantity += change;
    if (item.quantity <= 0) {
      this.removeFromCart(item);
    } else {
      item.totalPrice = item.price * item.quantity;
      this.refreshCart();
    }
  }

  removeFromCart(item: any): void {
    this.cartItems = this.cartItems.filter(i => i.productId !== item.productId);
    this.refreshCart();
  }

  refreshCart(): void {
    this.cartDataSource.data = [...this.cartItems]; 
    this.calculateTotals();
  }

   onPhoneSearch(): void {
    clearTimeout(this.phoneSearchTimeout);
    if (this.customerPhone.trim().length < 3) {
      this.customerName = 'Walk-in Customer';
      this.isExistingCustomer = false;
      return;
    }

    this.phoneSearchTimeout = setTimeout(() => {
      this.api.searchCustomers(this.customerPhone).subscribe({
        next: (customers) => {
          if (customers && customers.length > 0) {
            // Found existing customer, auto-fill and lock the name
            this.customerName = customers[0].name;
            this.isExistingCustomer = true;
          } else {
            // New number, let them type the name
            this.customerName = '';
            this.isExistingCustomer = false;
          }
        },
        error: () => {
          this.customerName = '';
          this.isExistingCustomer = false;
        }
      });
    }, 400);
  }

  calculateTotals(): void {
    this.subTotal = this.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Conditional GST Calculation
    if (this.isGstEnabled) {
      this.totalGst = this.cartItems.reduce((sum, item) => sum + (item.totalPrice * item.gstPercentage / 100), 0);
      this.netAmount = (this.subTotal + this.totalGst) - this.discount;
    } else {
      this.totalGst = 0;
      this.netAmount = this.subTotal - this.discount; // No GST added
    }
    
    if (this.netAmount < 0) this.netAmount = 0;
  }

    submitInvoice(): void {
    if (this.cartItems.length === 0) {
      this.snackBar.open('Cart is empty!', 'Close', { duration: 2000 });
      return;
    }

    const payload = {
      customerName: this.customerName,
      paymentMethod: this.paymentMethod,
      customerPhone: this.customerPhone, // MAKE SURE THIS IS HERE
      discount: this.discount,
      status: this.paymentMethod === 'CREDIT' ? 'PENDING' : 'PAID',
      items: this.cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    this.api.post<any>('/invoices', payload).subscribe({
      next: (res) => {
        // Open the Invoice Preview Dialog directly on screen!
        this.dialog.open(InvoicePreviewDialogComponent, {
          width: '80vw',
          height: '90vh',
          data: { invoiceNumber: res.invoiceNumber }
        });

        // Reset Cart
        this.cartItems = [];
        this.refreshCart();
        this.discount = 0;
        this.customerName = 'Walk-in Customer';
        this.paymentMethod = 'CASH';
      },
      error: (err) => {
        this.snackBar.open('Error: ' + err.error.message, 'Close', { duration: 3000 });
      }
    });
  }

  
}