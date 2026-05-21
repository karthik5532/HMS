import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { ToolbarModule } from 'primeng/toolbar';
import { PanelModule } from 'primeng/panel';

import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, TagModule, ButtonModule, CardModule, TooltipModule, InputTextModule, AvatarModule, ToolbarModule, PanelModule, DialogModule, SelectModule],
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit {
  invoices: any[] = [];
  totalOutstanding = 0;
  searchTerm: string = '';

  showNewBillModal = false;
  newBill: any = {
    patientName: '',
    type: '',
    amount: null,
    status: 'Unpaid'
  };

  categoryOptions = ['Consultation', 'Laboratory', 'Pharmacy', 'Surgery', 'General Ward'];
  statusOptions = ['Paid', 'Pending', 'Partially Paid', 'Unpaid'];

  ngOnInit() {
    this.calculateTotals();
  }

  calculateTotals() {
    this.totalOutstanding = this.invoices
      .filter(i => i.status !== 'Paid')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }

  generateBill() {
    if (!this.newBill.patientName || !this.newBill.type || this.newBill.amount == null) {
      return; // Basic validation
    }

    const newInvoice = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: this.newBill.patientName,
      type: this.newBill.type,
      amount: this.newBill.amount,
      date: new Date().toISOString().split('T')[0],
      status: this.newBill.status
    };

    this.invoices.unshift(newInvoice); // Add to top of list
    this.calculateTotals();
    
    // Reset form
    this.newBill = { patientName: '', type: '', amount: null, status: 'Unpaid' };
    this.showNewBillModal = false;
  }

  getStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch(status.toLowerCase()) {
      case 'paid': return 'success';
      case 'pending': return 'warn';
      case 'partially paid': return 'info';
      case 'unpaid': return 'danger';
      default: return 'secondary';
    }
  }
}
