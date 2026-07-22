import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicePreviewDialog } from './invoice-preview-dialog';

describe('InvoicePreviewDialog', () => {
  let component: InvoicePreviewDialog;
  let fixture: ComponentFixture<InvoicePreviewDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoicePreviewDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoicePreviewDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
