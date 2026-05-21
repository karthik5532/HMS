import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../core/services/socket.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { RouterModule, Router } from '@angular/router';
import { PatientService } from '../../core/services/patient.service';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ChartModule, TableModule, TagModule, ButtonModule, AvatarModule, TooltipModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  today = new Date();
  queue: any[] = [];
  messages: any[] = [];
  newMessage = '';
  currentUser: any;
  
  stats = {
    totalPatients: 0,
    admittedPatients: 0,
    appointmentsToday: 0,
    appointmentsTotal: 0,
    availableBeds: 50,
    totalBeds: 50,
    revenueMonthly: 0,
    totalInvoices: 0
  };

  recentPatients: any[] = [];
  upcomingAppointments: any[] = [];

  private queueSub: Subscription | undefined;
  private messageSub: Subscription | undefined;
  private pollStatsSub: Subscription | undefined;
  private pollQueueSub: Subscription | undefined;

  chartData: any;
  chartOptions: any;
  pieData: any;
  pieOptions: any;

  constructor(
    private socketService: SocketService,
    private patientService: PatientService,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.getUser();
  }

  ngOnInit(): void {
    console.log('Dashboard Initializing...');

    if (this.currentUser?.role === 'Doctor') {
      this.router.navigate(['/doctor-dashboard']);
      return;
    }
    
    this.fetchQueue();
    this.fetchStats();
    this.initCharts();
    this.socketService.joinQueueRoom();

    this.queueSub = this.socketService.onQueueUpdate().subscribe(() => {
        this.fetchQueue();
    });

    this.messageSub = this.socketService.onNewMessage().subscribe((msg) => {
        this.messages.push(msg);
    });

    this.socketService.onPatientAdded().subscribe(() => {
        console.log('Socket: Patient Added Detected');
        this.fetchStats();
    });

    this.socketService.onPatientUpdated().subscribe(() => {
        this.fetchStats();
    });

    this.socketService.onPatientDeleted().subscribe(() => {
        this.fetchStats();
    });

    // Real-time queue updates (appointments)
    this.socketService.onQueueUpdated().subscribe(() => {
        this.fetchQueue();
    });

    // --- Polling fallback (10s) guarantees fresh data even when sockets are stale ---
    this.pollStatsSub = interval(10000).pipe(
      switchMap(() => this.patientService.getPatients())
    ).subscribe({
      next: (data) => {
        this.stats.totalPatients = data.length;
        this.stats.admittedPatients = data.filter((p: any) => !p.status || p.status !== 'Discharged').length;
        this.recentPatients = [...data]
          .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 5);
        this.cd.markForCheck();
      },
      error: () => {}
    });

    this.pollQueueSub = interval(10000).pipe(
      switchMap(() => this.http.get<any[]>('http://127.0.0.1:5001/api/queue'))
    ).subscribe({
      next: (data) => {
        this.queue = data.filter((a: any) => a.status !== 'Completed');
        this.stats.appointmentsToday = this.queue.length;
        this.stats.appointmentsTotal = data.length;
        this.cd.markForCheck();
      },
      error: () => {}
    });
  }

  fetchStats() {
    this.patientService.getPatients().subscribe({
      next: (data) => {
        console.log('Dashboard Stats SUCCESS:', data);
        this.stats.totalPatients = data.length;
        this.stats.admittedPatients = data.filter(p => !p.status || p.status !== 'Discharged').length;
        this.recentPatients = [...data]
          .sort((a,b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 5);
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Dashboard Stats ERROR:', err);
      }
    });
  }

  fetchQueue() {
    this.http.get<any[]>('http://127.0.0.1:5001/api/queue').subscribe({
      next: (data) => {
        this.queue = data.filter((a: any) => a.status !== 'Completed');
        this.stats.appointmentsToday = this.queue.length;
        this.stats.appointmentsTotal = data.length;
        this.cd.markForCheck();
      },
      error: (err) => console.error('Queue Fetch Error:', err)
    });
  }

  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color') || '#475569';
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#94a3b8';
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#f1f5f9';

    this.chartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Admissions',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          borderColor: '#4f46e5', // Deep Indigo
          borderWidth: 3,
          tension: 0.4,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#4f46e5',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Discharges',
          data: [28, 48, 40, 19, 86, 27, 90],
          fill: false,
          borderColor: '#ec4899', // Pink Pop
          borderWidth: 3,
          tension: 0.4,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#ec4899',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: textColor, usePointStyle: true, boxWidth: 8 }
        }
      },
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { 
          ticks: { color: textColorSecondary, font: {weight: 500} }, 
          grid: { display: false } 
        },
        y: { 
          ticks: { color: textColorSecondary, font: {weight: 500} }, 
          grid: { color: surfaceBorder, drawBorder: false },
          border: { display: false }
        }
      }
    };

    this.pieData = {
      labels: ['Cardiology', 'Pediatrics', 'Neurology', 'Orthopedics', 'Others'],
      datasets: [
        {
          data: [35, 25, 20, 15, 5],
          backgroundColor: ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'],
          hoverBackgroundColor: ['#4338ca', '#0284c7', '#059669', '#d97706', '#db2777'],
          borderWidth: 0,
          borderRadius: 4
        }
      ]
    };

    this.pieOptions = {
      cutout: '75%',
      plugins: { 
        legend: { 
          position: 'right',
          labels: { usePointStyle: true, color: textColor, padding: 20, font: {weight: 500} } 
        }
      }
    };
  }

  sendMessage() {
      if (this.newMessage.trim()) {
          const msgData = {
              sender: this.currentUser?.name || 'Staff Member',
              text: this.newMessage,
              time: new Date()
          };
          this.socketService.sendMessage(msgData);
          this.newMessage = '';
      }
  }

  ngOnDestroy(): void {
      this.queueSub?.unsubscribe();
      this.messageSub?.unsubscribe();
      this.pollStatsSub?.unsubscribe();
      this.pollQueueSub?.unsubscribe();
  }
}


