import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-add-product-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, 
    MatInputModule, MatButtonModule
  ],
  templateUrl: './add-product-dialog.html',
  styleUrls: ['./add-product-dialog.scss']
})
export class AddProductDialogComponent {
  productForm: FormGroup;
  isGstEnabled: boolean = environment.gstEnabled;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddProductDialogComponent>
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      sku: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      gstPercentage: [this.isGstEnabled ? 18 : 0, Validators.required],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      minStockThreshold: [5, [Validators.required, Validators.min(0)]],
      categoryName: ['General']
    });
  }

  onCancel(): void {
    this.dialogRef.close(null); // Close without saving
  }

  onSave(): void {
    if (this.productForm.valid) {
      this.dialogRef.close(this.productForm.value); // Pass data back
    }
  }
}