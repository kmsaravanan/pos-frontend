import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface RecordPaymentDialogData {
  invoiceNumber: string;
  netAmount: number;
  paidAmount: number;
  balanceAmount: number;
}

@Component({
  selector: 'app-record-payment-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule
  ],
  templateUrl: './record-payment-dialog.html',
  styleUrls: ['./record-payment-dialog.scss']
})
export class RecordPaymentDialogComponent {
  paymentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RecordPaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RecordPaymentDialogData
  ) {
    this.paymentForm = this.fb.group({
      amount: [
        data.balanceAmount,
        [Validators.required, Validators.min(0.01), Validators.max(data.balanceAmount)]
      ]
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSave(): void {
    if (this.paymentForm.valid) {
      this.dialogRef.close(this.paymentForm.value.amount);
    }
  }
}
