import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { ProductListComponent } from './features/product/product-list/product-list.component';
import { InvoiceCreateComponent } from './features/invoice/invoice-create/invoice-create.component';
import { InvoiceListComponent } from './features/invoice/invoice-list/invoice-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'invoices/create', component: InvoiceCreateComponent },
    { path: 'invoices', component: InvoiceListComponent }, // UNCOMMENTED
  // We'll add invoices later
];