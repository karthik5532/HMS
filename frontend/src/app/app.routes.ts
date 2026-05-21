import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LayoutComponent } from './components/layout/layout.component';
import { PatientsComponent } from './pages/patients/patients.component';
import { DoctorsComponent } from './pages/doctors/doctors.component';
import { PharmacyComponent } from './pages/pharmacy/pharmacy.component';
import { LabsComponent } from './pages/labs/labs.component';
import { SignupComponent } from './pages/signup/signup.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { BillingComponent } from './pages/billing/billing.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { DoctorDashboardComponent } from './pages/doctor-dashboard/doctor-dashboard.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: '', 
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'doctor-dashboard', component: DoctorDashboardComponent },
      { path: 'patients', component: PatientsComponent },
      { path: 'doctors', component: DoctorsComponent },
      { path: 'pharmacy', component: PharmacyComponent },
      { path: 'labs', component: LabsComponent },
      { path: 'appointments', component: AppointmentsComponent },
      { path: 'billing', component: BillingComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'settings', component: SettingsComponent },
      { 
        path: '', 
        redirectTo: 'login', 
        pathMatch: 'full' 
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
