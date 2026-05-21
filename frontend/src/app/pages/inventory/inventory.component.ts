import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../core/services/inventory.service';

// PrimeNG
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
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-inventory',
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
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {
  inventoryItems: any[] = [];
  filteredItems: any[] = [];
  searchTerm = '';
  loading = false;
  showDialog = false;
  isEditing = false;
  newItem: any = {};

  // Stats
  totalItems = 0;
  activeCount = 0;
  maintenanceCount = 0;
  criticalCount = 0;

  categoryOptions = [
    { label: 'Medical Equipment', value: 'Medical Equipment' },
    { label: 'Surgical Instruments', value: 'Surgical Instruments' },
    { label: 'Diagnostic Devices', value: 'Diagnostic Devices' },
    { label: 'Patient Care', value: 'Patient Care' },
    { label: 'Lab Supplies', value: 'Lab Supplies' },
    { label: 'Emergency Equipment', value: 'Emergency Equipment' },
    { label: 'Radiology', value: 'Radiology' },
    { label: 'Pharmacy Supplies', value: 'Pharmacy Supplies' },
    { label: 'IT & Electronics', value: 'IT & Electronics' },
    { label: 'Furniture & Fixtures', value: 'Furniture & Fixtures' },
    { label: 'Consumables', value: 'Consumables' },
    { label: 'Other', value: 'Other' }
  ];

  statusOptions = [
    { label: 'Active / In Stock', value: 'Active' },
    { label: 'In Use', value: 'In Use' },
    { label: 'Under Maintenance', value: 'Maintenance' },
    { label: 'Critical / Low', value: 'Critical' },
    { label: 'Decommissioned', value: 'Decommissioned' }
  ];

  constructor(
    private inventoryService: InventoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory() {
    this.loading = true;
    this.inventoryService.getInventory().subscribe({
      next: (data) => {
        this.inventoryItems = data;
        this.onSearch();
        this.calculateStats();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load inventory' });
        this.loading = false;
      }
    });
  }

  calculateStats() {
    this.totalItems = this.inventoryItems.length;
    this.activeCount = this.inventoryItems.filter(i =>
      i.status?.toLowerCase().includes('active') || i.status?.toLowerCase().includes('stock')
    ).length;
    this.maintenanceCount = this.inventoryItems.filter(i =>
      i.status?.toLowerCase().includes('maintenance') || i.status?.toLowerCase().includes('use')
    ).length;
    this.criticalCount = this.inventoryItems.filter(i =>
      i.status?.toLowerCase().includes('critical') || i.status?.toLowerCase().includes('demand')
    ).length;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredItems = [...this.inventoryItems];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredItems = this.inventoryItems.filter(i =>
      (i.name && i.name.toLowerCase().includes(term)) ||
      (i.category && i.category.toLowerCase().includes(term)) ||
      (i.id && i.id.toLowerCase().includes(term))
    );
  }

  openNew() {
    this.isEditing = false;
    this.newItem = { status: 'Active', stock: 1 };
    this.showDialog = true;
  }

  editItem(item: any) {
    this.isEditing = true;
    this.newItem = { ...item };
    this.showDialog = true;
  }

  deleteItem(item: any) {
    this.confirmationService.confirm({
      message: `Decommission <strong>${item.name}</strong>? This action will remove it from inventory.`,
      header: 'Confirm Decommission',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const id = item._id || item.id;
        this.inventoryService.deleteItem(id).subscribe({
          next: () => {
            this.loadInventory();
            this.messageService.add({ severity: 'success', summary: 'Removed', detail: 'Asset decommissioned', life: 3000 });
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' })
        });
      }
    });
  }

  saveItem() {
    if (!this.newItem.name || !this.newItem.category) {
      this.messageService.add({ severity: 'warn', summary: 'Incomplete', detail: 'Asset name and category are required' });
      return;
    }

    const payload = { ...this.newItem };

    if (this.isEditing) {
      const id = payload._id || payload.id;
      this.inventoryService.updateItem(id, payload).subscribe({
        next: () => {
          this.loadInventory();
          this.showDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Asset updated', life: 3000 });
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' })
      });
    } else {
      payload.id = 'INV-' + Date.now().toString().slice(-5);
      this.inventoryService.createItem(payload).subscribe({
        next: () => {
          this.loadInventory();
          this.showDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Added', detail: 'New asset registered', life: 3000 });
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Add failed: ' + (err.error?.error || 'Unknown') })
      });
    }
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const s = (status || '').toLowerCase();
    if (s.includes('active') || s.includes('stock')) return 'success';
    if (s.includes('use')) return 'info';
    if (s.includes('maintenance')) return 'warn';
    if (s.includes('critical') || s.includes('demand')) return 'danger';
    return 'secondary';
  }
}
