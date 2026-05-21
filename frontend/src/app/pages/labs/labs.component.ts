import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabService } from '../../core/services/lab.service';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-labs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    TagModule,
    TooltipModule,
    CardModule,
    ConfirmDialogModule,
    TextareaModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './labs.component.html',
  styleUrls: ['./labs.component.css']
})
export class LabsComponent implements OnInit {
  reports: any[] = [];
  searchTerm = '';
  filteredReports: any[] = [];
  displayDialog = false;
  isEditing = false;
  report: any = {};
  loading = false;

  // Stats
  pendingCount = 0;
  inProgressCount = 0;
  completedCount = 0;
  totalCount = 0;

  statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' }
  ];

  resultOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Normal', value: 'Normal' },
    { label: 'Abnormal', value: 'Abnormal' },
    { label: 'Clear', value: 'Clear' }
  ];

  testTypeOptions = [
    { label: 'Complete Blood Count (CBC)', value: 'CBC' },
    { label: 'Blood Glucose', value: 'Blood Glucose' },
    { label: 'Lipid Profile', value: 'Lipid Profile' },
    { label: 'Liver Function Test (LFT)', value: 'LFT' },
    { label: 'Kidney Function Test (KFT)', value: 'KFT' },
    { label: 'Thyroid Profile', value: 'Thyroid Profile' },
    { label: 'Urine Analysis', value: 'Urine Analysis' },
    { label: 'MRI Scan', value: 'MRI Scan' },
    { label: 'CT Scan', value: 'CT Scan' },
    { label: 'X-Ray', value: 'X-Ray' },
    { label: 'ECG', value: 'ECG' },
    { label: 'Echocardiography', value: 'Echo' },
    { label: 'Stool Test', value: 'Stool Test' },
    { label: 'COVID PCR', value: 'COVID PCR' },
    { label: 'Serology / Antibody', value: 'Serology' },
    { label: 'Culture & Sensitivity', value: 'Culture' },
    { label: 'Other', value: 'Other' }
  ];

  constructor(
    private labService: LabService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports() {
    this.loading = true;
    this.labService.getReports().subscribe({
      next: (data) => {
        this.reports = data;
        this.onSearch();
        this.calculateStats();
        this.loading = false;
        this.cd.markForCheck();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load lab reports' });
        this.loading = false;
      }
    });
  }

  calculateStats() {
    this.totalCount = this.reports.length;
    this.pendingCount = this.reports.filter(r => r.status === 'Pending').length;
    this.inProgressCount = this.reports.filter(r => r.status === 'In Progress').length;
    this.completedCount = this.reports.filter(r => r.status === 'Completed').length;
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredReports = [...this.reports];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredReports = this.reports.filter(r =>
      (r.patientName && r.patientName.toLowerCase().includes(term)) ||
      (r.testType && r.testType.toLowerCase().includes(term)) ||
      (r.id && r.id.toLowerCase().includes(term)) ||
      (r.requestedBy && r.requestedBy.toLowerCase().includes(term))
    );
  }

  openNew() {
    this.report = {
      status: 'Pending',
      result: 'Pending',
      date: new Date()
    };
    this.isEditing = false;
    this.displayDialog = true;
  }

  editReport(report: any) {
    this.report = { ...report };
    if (this.report.date) {
      this.report.date = new Date(this.report.date);
    }
    this.isEditing = true;
    this.displayDialog = true;
  }

  deleteReport(report: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete report <strong>${report.id}</strong>?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.labService.deleteReport(report._id || report.id).subscribe({
          next: () => {
            this.loadReports();
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Lab report removed', life: 3000 });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' });
          }
        });
      }
    });
  }

  saveReport() {
    if (!this.report.patientName || !this.report.testType || !this.report.requestedBy || !this.report.date) {
      this.messageService.add({ severity: 'warn', summary: 'Incomplete', detail: 'Please fill all required fields' });
      return;
    }

    const payload = { ...this.report };
    if (payload.date instanceof Date) {
      payload.date = payload.date.toISOString().split('T')[0];
    }

    if (this.isEditing) {
      const id = this.report._id || this.report.id;
      this.labService.updateReport(id, payload).subscribe({
        next: () => {
          this.loadReports();
          this.displayDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Lab report updated', life: 3000 });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed: ' + (err.error?.error || 'Unknown error') });
        }
      });
    } else {
      payload.id = 'LB-' + Date.now().toString().slice(-6);
      this.labService.createReport(payload).subscribe({
        next: () => {
          this.loadReports();
          this.displayDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Lab report added successfully', life: 3000 });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Creation failed: ' + (err.error?.error || 'Unknown error') });
        }
      });
    }
  }

  downloadReport(report: any) {
    const reportContent = `
Diagnostic Lab Report
=====================
Order ID: #${report.id || report._id}
Patient Name: ${report.patientName}
Test Type: ${report.testType}
Requested By: ${report.requestedBy}

Date: ${new Date(report.date).toLocaleDateString()}
Status: ${report.status}
Result: ${report.result || 'Pending'}
Clinical Notes: ${report.notes || 'No remarks provided'}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LabReport_${report.id || 'export'}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.messageService.add({ severity: 'info', summary: 'Downloaded', detail: 'Report downloaded as Text file', life: 3000 });
  }

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Pending': return 'warn';
      default: return 'secondary';
    }
  }

  getResultSeverity(result: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (result) {
      case 'Normal':
      case 'Clear': return 'success';
      case 'Abnormal': return 'danger';
      default: return 'warn';
    }
  }
}
