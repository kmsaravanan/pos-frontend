import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-invoice-preview-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './invoice-preview-dialog.html',
  styleUrls: ['./invoice-preview-dialog.scss']
})
export class InvoicePreviewDialogComponent implements OnInit {
  invoiceNumber: string = '';
  pdfUrl!: SafeResourceUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<InvoicePreviewDialogComponent>,
    private api: ApiService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar
  ) {
    this.invoiceNumber = data.invoiceNumber;
  }

  ngOnInit(): void {
    this.loadPdf();
  }

  loadPdf(): void {
    this.api.getPdf(`/invoices/${this.invoiceNumber}/pdf`).subscribe({
      next: (blob) => {
        // Create a blob URL and sanitize it so Angular allows it in the iframe
        const unsafeUrl = URL.createObjectURL(blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
      },
      error: (err) => {
        this.snackBar.open('Failed to load invoice PDF.', 'Close', { duration: 3000 });
        console.error(err);
        this.dialogRef.close();
      }
    });
  }

  downloadPdf(): void {
    this.api.getPdf(`/invoices/${this.invoiceNumber}/pdf`).subscribe({
      next: (blob) => {
        const fileURL = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = `${this.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(fileURL);
      },
      error: (err) => {
        this.snackBar.open('Failed to download PDF.', 'Close', { duration: 3000 });
      }
    });
  }
}