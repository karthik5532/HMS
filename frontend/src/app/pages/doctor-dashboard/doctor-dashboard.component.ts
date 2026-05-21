import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../core/services/socket.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { PatientService } from '../../core/services/patient.service';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TextareaModule } from 'primeng/textarea';
import { BadgeModule } from 'primeng/badge';
import { PanelModule } from 'primeng/panel';
import { ChartModule } from 'primeng/chart';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    TableModule, 
    TagModule, 
    CardModule, 
    ButtonModule, 
    AvatarModule, 
    TextareaModule, 
    BadgeModule, 
    PanelModule,
    ChartModule,
    TooltipModule,
    ProgressBarModule,
    InputTextModule
  ],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.css'
})
export class DoctorDashboardComponent implements OnInit, OnDestroy {
  today = new Date();
  myAppointments: any[] = [];
  myPatients: any[] = [];
  currentUser: any;
  
  chartData: any;
  chartOptions: any;

  stats = {
    myAppointmentsToday: 0,
    myTotalPatients: 0,
    completedToday: 0
  };

  private pollSub: Subscription | undefined;
  private socketSub: Subscription | undefined;

  constructor(
    private socketService: SocketService,
    private patientService: PatientService,
    private http: HttpClient,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.getUser();
  }

  ngOnInit(): void {
    this.fetchDoctorData();
    this.initChart();
    this.socketService.joinQueueRoom();

    this.socketSub = this.socketService.onQueueUpdate().subscribe(() => {
        this.fetchDoctorData();
    });

    this.pollSub = interval(10000).subscribe(() => {
        this.fetchDoctorData();
    });
  }

  initChart() {
    this.chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Consultations',
                data: [12, 19, 15, 23, 10, 5, 2],
                fill: true,
                borderColor: '#6366f1',
                tension: 0.4,
                backgroundColor: 'rgba(99, 102, 241, 0.1)'
            }
        ]
    };

    this.chartOptions = {
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                display: false
            },
            x: {
                display: false
            }
        },
        maintainAspectRatio: false
    };
  }

  fetchDoctorData() {
    if (!this.currentUser) return;

    // Fetch Appointments for this doctor
    this.http.get<any[]>('http://127.0.0.1:5001/api/queue').subscribe({
      next: (data) => {
        this.myAppointments = data.filter(a => 
          a.doctorName === this.currentUser.name && 
          a.status !== 'Completed' && 
          a.status !== 'Cancelled'
        );
        this.stats.myAppointmentsToday = this.myAppointments.length;
        this.stats.completedToday = data.filter(a => 
            a.doctorName === this.currentUser.name && 
            a.status === 'Completed' &&
            new Date(a.updatedAt).toDateString() === new Date().toDateString()
        ).length;
        this.cd.markForCheck();
      }
    });

    // Fetch Patients (those who have seen this doctor or assigned to them)
    // For now, let's filter patients from the main list who have an appointment with this doctor
    this.patientService.getPatients().subscribe({
        next: (patients) => {
            // This logic might need refinement based on how patients are assigned to doctors
            this.myPatients = patients.slice(0, 10); // Placeholder
            this.stats.myTotalPatients = this.myPatients.length;
            this.cd.markForCheck();
        }
    })
  }

  updateAppointmentStatus(id: string, status: string) {
      this.http.patch(`http://127.0.0.1:5001/api/queue/${id}`, { status }).subscribe(() => {
          this.fetchDoctorData();
      });
  }

  getSeverity(status: string) {
      switch (status) {
          case 'Waiting': return 'warn';
          case 'In Consultation': return 'info';
          case 'Completed': return 'success';
          case 'Cancelled': return 'danger';
          default: return 'info';
      }
  }

  ngOnDestroy(): void {
      this.pollSub?.unsubscribe();
      this.socketSub?.unsubscribe();
  }
}
