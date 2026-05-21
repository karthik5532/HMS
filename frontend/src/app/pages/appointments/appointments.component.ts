import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SocketService } from '../../core/services/socket.service';

import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SplitterModule } from 'primeng/splitter';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    CardModule,
    TagModule,
    ToastModule,
    SplitterModule,
    TableModule,
    DialogModule,
    AvatarModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit, OnDestroy {
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  currentTab = 'Active';
  filterDoctor: string | null = null;
  selectedAppointment: any = null;
  showEnrollModal = false;

  stats = {
    totalActive: 0,
    urgentCount: 0,
    completedCount: 0,
    avgWait: '15m'
  };

  doctors = [
    'Dr. Rajesh Sharma (Cardiology)', 'Dr. Priya Patel (Cardiology)',
    'Dr. Amit Verma (Pediatrics)', 'Dr. Neha Malhotra (Pediatrics)',
    'Dr. Sandeep Singh (Neurology)', 'Dr. Ishita Dutta (Neurology)',
    'Dr. Vikash Goel (Orthopedics)', 'Dr. Pooja Hegde (Orthopedics)',
    'Dr. Sameer Khan (Dermatology)', 'Dr. Anjali Desai (Dermatology)',
    'Dr. Vikram Seth (Radiology)', 'Dr. Meera Bai (Radiology)'
  ];

  newBooking = {
    patientName: '',
    doctorName: '',
    reason: '',
    status: 'Waiting'
  };

  private queueSub: Subscription | undefined;
  private pollSub: Subscription | undefined;

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private messageService: MessageService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Immediate load on component mount
    this.loadAppointments();

    // 5-second auto-poll — guaranteed refresh regardless of socket state
    this.pollSub = interval(5000).pipe(
      switchMap(() => this.http.get<any[]>('http://127.0.0.1:5001/api/queue'))
    ).subscribe({
      next: (data) => {
        this.appointments = data;
        this.applyFilter();
        this.cd.markForCheck();
      },
      error: () => {} // silent fail on poll — avoid spamming toast
    });

    // Socket subscription for instant update when backend emits
    this.queueSub = this.socketService.onQueueUpdated().subscribe(() => {
      this.loadAppointments();
    });
  }

  ngOnDestroy(): void {
    this.queueSub?.unsubscribe();
    this.pollSub?.unsubscribe();
  }

  loadAppointments() {
    this.http.get<any[]>('http://127.0.0.1:5001/api/queue').subscribe({
      next: (data) => {
        this.appointments = data;
        this.applyFilter();
        this.cd.markForCheck();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Connection Error',
          detail: 'Could not reach the appointment server.'
        });
      }
    });
  }

  setTab(t: string) {
    this.currentTab = t;
    this.applyFilter();
    this.loadAppointments(); // force fresh fetch on tab switch
  }

  applyFilter() {
    let baseData = this.appointments;

    this.stats.totalActive    = this.appointments.filter(a => a.status !== 'Completed').length;
    this.stats.completedCount = this.appointments.filter(a => a.status === 'Completed').length;
    this.stats.urgentCount    = this.appointments.filter(a => a.status === 'In Consultation').length;

    if (this.currentTab === 'Active') {
      baseData = baseData.filter(a => a.status !== 'Completed');
    } else {
      baseData = baseData.filter(a => a.status === 'Completed');
    }

    if (this.filterDoctor) {
      baseData = baseData.filter(a => a.doctorName === this.filterDoctor);
    }

    this.filteredAppointments = baseData;
    
    // Auto-select first item if nothing is selected or if selected is no longer in list
    if (this.filteredAppointments.length > 0) {
      if (!this.selectedAppointment || !this.filteredAppointments.find(a => a._id === this.selectedAppointment._id)) {
        this.selectedAppointment = this.filteredAppointments[0];
      }
    } else {
      this.selectedAppointment = null;
    }
  }

  bookNow() {
    if (!this.newBooking.patientName) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Name', detail: 'Enter patient name.' });
      return;
    }
    if (!this.newBooking.doctorName) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Doctor', detail: 'Select a specialist.' });
      return;
    }
    this.http.post('http://127.0.0.1:5001/api/queue', this.newBooking).subscribe({
      next: () => {
        this.loadAppointments();
        this.newBooking = { patientName: '', doctorName: '', reason: '', status: 'Waiting' };
        this.showEnrollModal = false;
        this.messageService.add({ severity: 'success', summary: 'Booked', detail: 'Appointment added to queue.' });
      },
      error: (err) => this.messageService.add({
        severity: 'error', summary: 'Error', detail: err.error?.message || 'Booking failed.'
      })
    });
  }
  
  selectAppointment(app: any) {
    this.selectedAppointment = app;
  }
  
  getSeverity(status: string) {
     switch (status) {
        case 'Waiting': return 'warn';
        case 'In Consultation': return 'danger';
        case 'Completed': return 'success';
        default: return 'info';
     }
  }

  updateStatus(id: string, s: string) {
    this.http.put(`http://127.0.0.1:5001/api/queue/${id}`, { status: s }).subscribe({
      next: () => this.loadAppointments(),
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Status update failed.' })
    });
  }
}
