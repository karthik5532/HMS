import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyService } from '../../core/services/pharmacy.service';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-pharmacy',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    DatePickerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.css']
})
export class PharmacyComponent implements OnInit {
  inventory: any[] = [];
  searchTerm = '';
  filteredInventory: any[] = [];
  showDialog = false;
  isEditing = false;
  newItem: any = {};
  loading = false;
  viewMode: 'table' | 'cards' = 'table';

  // Stats
  totalMeds = 0;
  inStockCount = 0;
  lowStockCount = 0;
  outStockCount = 0;

  categoryOptions = [
    { label: 'Analgesics', value: 'Analgesics' },
    { label: 'Antibiotics', value: 'Antibiotics' },
    { label: 'Antivirals', value: 'Antivirals' },
    { label: 'Antifungals', value: 'Antifungals' },
    { label: 'Antidiabetics', value: 'Antidiabetics' },
    { label: 'Antihypertensives', value: 'Antihypertensives' },
    { label: 'Anticoagulants', value: 'Anticoagulants' },
    { label: 'Antipyretics', value: 'Antipyretics' },
    { label: 'Antihistamines', value: 'Antihistamines' },
    { label: 'Steroids', value: 'Steroids' },
    { label: 'Vitamins & Supplements', value: 'Vitamins & Supplements' },
    { label: 'Cardiovascular', value: 'Cardiovascular' },
    { label: 'Gastrointestinal', value: 'Gastrointestinal' },
    { label: 'Neurological', value: 'Neurological' },
    { label: 'Respiratory', value: 'Respiratory' },
    { label: 'Vaccines', value: 'Vaccines' },
    { label: 'Others', value: 'Others' }
  ];

  statusOptions = [
    { label: 'In Stock', value: 'In Stock' },
    { label: 'Low Stock', value: 'Low Stock' },
    { label: 'Out of Stock', value: 'Out of Stock' }
  ];

  constructor(
    private pharmacyService: PharmacyService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadMedicines();
  }

  loadMedicines() {
    this.loading = true;
    this.pharmacyService.getMedicines().subscribe({
      next: (data) => {
        this.inventory = data;
        this.onSearch();
        this.calculateStats();
        this.loading = false;
        this.cd.markForCheck()
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load medicines' });
        this.loading = false;
      }
    });
  }

  calculateStats() {
    this.totalMeds = this.inventory.length;
    this.inStockCount = this.inventory.filter(i => i.status === 'In Stock').length;
    this.lowStockCount = this.inventory.filter(i => i.status === 'Low Stock').length;
    this.outStockCount = this.inventory.filter(i => i.status === 'Out of Stock').length;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredInventory = [...this.inventory];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredInventory = this.inventory.filter(item =>
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.category && item.category.toLowerCase().includes(term)) ||
      (item.id && item.id.toLowerCase().includes(term))
    );
  }

  openNew() {
    this.isEditing = false;
    this.newItem = { status: 'In Stock', stock: 0, price: 0 };
    this.showDialog = true;
  }

  editItem(item: any) {
    this.isEditing = true;
    this.newItem = { ...item };
    if (this.newItem.expiry) {
      this.newItem.expiry = new Date(this.newItem.expiry);
    }
    this.showDialog = true;
  }

  deleteItem(item: any) {
    this.confirmationService.confirm({
      message: `Remove <strong>${item.name}</strong> from inventory?`,
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const id = item._id || item.id;
        this.pharmacyService.deleteMedicine(id).subscribe({
          next: () => {
            this.loadMedicines();
            this.messageService.add({ severity: 'success', summary: 'Removed', detail: 'Medicine removed from inventory', life: 3000 });
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' })
        });
      }
    });
  }

  saveItem() {
    if (!this.newItem.name || !this.newItem.category) {
      this.messageService.add({ severity: 'warn', summary: 'Incomplete', detail: 'Please fill medicine name and category' });
      return;
    }

    const payload = { ...this.newItem };
    if (payload.expiry instanceof Date) {
      payload.expiry = payload.expiry.toISOString().split('T')[0];
    }

    if (this.isEditing) {
      const id = payload._id || payload.id;
      this.pharmacyService.updateMedicine(id, payload).subscribe({
        next: () => {
          this.loadMedicines();
          this.showDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Medicine updated', life: 3000 });
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' })
      });
    } else {
      payload.id = 'MD-' + Date.now().toString().slice(-5);
      this.pharmacyService.createMedicine(payload).subscribe({
        next: () => {
          this.loadMedicines();
          this.showDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Medicine added to inventory', life: 3000 });
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Add failed: ' + (err.error?.error || 'Unknown') })
      });
    }
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'In Stock': return 'success';
      case 'Low Stock': return 'warn';
      case 'Out of Stock': return 'danger';
      default: return 'secondary';
    }
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'stock-out';
    if (stock < 50) return 'stock-low';
    return 'stock-ok';
  }
}
