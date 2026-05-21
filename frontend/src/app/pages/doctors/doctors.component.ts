import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../core/services/doctor.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { TabsModule } from 'primeng/tabs';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ToastModule,
    CardModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    DialogModule,
    AvatarModule,
    TabsModule,
    PanelModule,
    TableModule,
    ConfirmDialogModule,
    SelectModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css']
})
export class DoctorsComponent implements OnInit {
  doctors: any[] = [];
  searchTerm = '';
  filteredDoctors: any[] = [];
  showModal = false;
  showScheduleModal = false;
  showMessageModal = false;
  isEditing = false;
  viewMode: 'grid' | 'table' = 'grid';
  newDoctor: any = {};
  activeDoctor: any = null;
  messageText = '';

  totalCount = 0;
  availableCount = 0;
  consultationCount = 0;
  leaveCount = 0;

  specialtyOptions = [
    'Cardiology', 'Pediatrics', 'Neurology', 'Orthopedics', 'Dermatology', 'Radiology', 'General'
  ];
  statusOptions = [
    'Available', 'In Consultation', 'On Leave', 'Emergency'
  ];

  weeklySchedule = [
    { day: 'Monday', time: '09:00 AM - 05:00 PM', slots: '12 available' },
    { day: 'Tuesday', time: '10:00 AM - 06:00 PM', slots: '8 available' },
    { day: 'Wednesday', time: '09:00 AM - 04:00 PM', slots: '5 available' },
    { day: 'Thursday', time: '11:00 AM - 07:00 PM', slots: '10 available' },
    { day: 'Friday', time: '09:00 AM - 05:00 PM', slots: '15 available' },
  ];

  departments = [
    { name: 'Cardiology', doctors: [
      { id: 'DR-001', name: 'Dr. Rajesh Sharma', specialty: 'Senior Cardiologist', status: 'Available', exp: '15+ Years', icon: 'pi pi-heart-fill' },
      { id: 'DR-002', name: 'Dr. Priya Patel', specialty: 'Interventional Cardiology', status: 'In Consultation', exp: '10+ Years', icon: 'pi pi-heart' }
    ]},
    { name: 'Pediatrics', doctors: [
      { id: 'DR-003', name: 'Dr. Amit Verma', specialty: 'Child Specialist', status: 'Available', exp: '12+ Years', icon: 'pi pi-face-smile' },
      { id: 'DR-004', name: 'Dr. Neha Malhotra', specialty: 'Neonatal Care', status: 'On Leave', exp: '8+ Years', icon: 'pi pi-filter' }
    ]},
    { name: 'Neurology', doctors: [
      { id: 'DR-005', name: 'Dr. Sandeep Singh', specialty: 'Neurosurgeon', status: 'Available', exp: '20+ Years', icon: 'pi pi-bolt' },
      { id: 'DR-006', name: 'Dr. Ishita Dutta', specialty: 'Neurologist', status: 'Emergency', exp: '14+ Years', icon: 'pi pi-share-alt' }
    ]},
    { name: 'Orthopedics', doctors: [
      { id: 'DR-007', name: 'Dr. Vikash Goel', specialty: 'Bone Specialist', status: 'Available', exp: '18+ Years', icon: 'pi pi-image' },
      { id: 'DR-008', name: 'Dr. Pooja Hegde', specialty: 'Joint Surgery', status: 'Available', exp: '9+ Years', icon: 'pi pi-table' }
    ]},
    { name: 'Dermatology', doctors: [
      { id: 'DR-009', name: 'Dr. Sameer Khan', specialty: 'Skin Specialist', status: 'Available', exp: '11+ Years', icon: 'pi pi-sun' },
      { id: 'DR-010', name: 'Dr. Anjali Desai', specialty: 'Cosmetic Surg', status: 'In Consultation', exp: '13+ Years', icon: 'pi pi-palette' }
    ]},
    { name: 'Radiology', doctors: [
      { id: 'DR-011', name: 'Dr. Vikram Seth', specialty: 'Imaging Specialist', status: 'Available', exp: '16+ Years', icon: 'pi pi-camera' },
      { id: 'DR-012', name: 'Dr. Meera Bai', specialty: 'Ultra-Sonographer', status: 'Available', exp: '7+ Years', icon: 'pi pi-search-plus' }
    ]}
  ];

  staffList = [
    { name: 'Sara Jones', role: 'Head Nurse', dept: 'Cardiology', shift: 'Morning' },
    { name: 'Mike Ross', role: 'Senior Lab Technician', dept: 'Diagnostics', shift: 'Evening' },
    { name: 'Rachel Zane', role: 'Medical Receptionist', dept: 'Admin', shift: 'General' },
    { name: 'Harvey Specter', role: 'Billing Manager', dept: 'Admin', shift: 'General' },
    { name: 'Donna Paulsen', role: 'Chief Staff Coordinator', dept: 'Admin', shift: 'General' },
    { name: 'Louis Litt', role: 'Logistics Head', dept: 'Inventory', shift: 'Morning' }
  ];

  constructor(
    private doctorService: DoctorService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors() {
    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.onSearch();
        this.calculateStats();
        this.cd.markForCheck();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not fetch doctors' });
      }
    });
  }

  viewSchedule(doctor: any) {
    this.activeDoctor = doctor;
    this.showScheduleModal = true;
  }

  openSendMessage(doctor: any) {
    this.activeDoctor = doctor;
    this.showMessageModal = true;
    this.messageText = `Hi ${doctor.name}, I need to discuss a patient referral...`;
  }

  confirmSendMessage() {
    this.messageService.add({ severity: 'success', summary: 'Sent', detail: `Message sent to ${this.activeDoctor.name}` });
    this.showMessageModal = false;
    this.messageText = '';
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredDoctors = [...this.doctors];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredDoctors = this.doctors.filter(d =>
      (d.name && d.name.toLowerCase().includes(term)) ||
      (d.specialty && d.specialty.toLowerCase().includes(term))
    );
  }

  calculateStats() {
    this.totalCount = this.doctors.length;
    this.availableCount = this.doctors.filter(d => (d.status || '').toLowerCase() === 'available').length;
    this.consultationCount = this.doctors.filter(d => (d.status || '').toLowerCase() === 'in consultation').length;
    this.leaveCount = this.doctors.filter(d => {
      const s = (d.status || '').toLowerCase();
      return s === 'on leave' || s === 'emergency';
    }).length;
  }

  editDoctor(doctor: any) {
    this.isEditing = true;
    this.newDoctor = { ...doctor };
    this.showModal = true;
  }

  deleteDoctor(id: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to deactivate and remove this specialist?',
      header: 'Confirm Deactivation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Remove',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.doctorService.deleteDoctor(id).subscribe({
          next: () => {
            this.loadDoctors();
            this.messageService.add({ severity: 'info', summary: 'Removed', detail: 'Doctor record deactivated' });
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Deactivation failed' })
        });
      }
    });
  }

  saveDoctor() {
    if (this.isEditing) {
      const id = this.newDoctor._id || this.newDoctor.id;
      this.doctorService.updateDoctor(id, this.newDoctor).subscribe({
        next: () => {
          this.loadDoctors();
          this.showModal = false;
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Profile saved successfully' });
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' })
      });
    } else {
      const payload = {
        ...this.newDoctor,
        id: 'DR-' + Math.floor(400 + Math.random() * 100),
        appointments: 0
      };
      this.doctorService.createDoctor(payload).subscribe({
        next: () => {
          this.loadDoctors();
          this.showModal = false;
          this.messageService.add({ severity: 'success', summary: 'Created', detail: 'New specialist added' });
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Creation failed' })
      });
    }
  }

  getStatusClass(status: string) {
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'available': return 'status-available';
      case 'in consultation': return 'status-consultation';
      case 'on leave': return 'status-leave';
      case 'emergency': return 'status-emergency';
      default: return '';
    }
  }

  getStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    if (!status) return 'info';
    switch (status.toLowerCase()) {
      case 'available': return 'success';
      case 'in consultation': return 'info';
      case 'on leave': return 'warn';
      case 'emergency': return 'danger';
      default: return 'info';
    }
  }
}
