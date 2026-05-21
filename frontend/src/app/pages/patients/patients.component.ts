import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../core/services/patient.service';
import { DoctorService } from '../../core/services/doctor.service';
import { SpeechService } from '../../core/services/speech.service';
import { SocketService } from '../../core/services/socket.service';

// PrimeNG Imports
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { TabsModule } from 'primeng/tabs';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { SplitterModule } from 'primeng/splitter';
import { PanelModule } from 'primeng/panel';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-patients',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    ButtonModule,
    InputNumberModule,
    ConfirmDialogModule,
    ToastModule,
    TableModule,
    TagModule,
    CardModule,
    IconFieldModule,
    InputIconModule,
    DividerModule,
    AvatarModule,
    AvatarGroupModule,
    TabsModule,
    ProgressBarModule,
    TooltipModule,
    SplitterModule,
    PanelModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css'
})
export class PatientsComponent implements OnInit {
  patients: any[] = [];
  searchTerm = '';
  filteredPatients: any[] = [];
  selectedPatient: any = null;
  viewMode: 'table' | 'grid' = 'table';
  viewDossierModal = false;

  showModal = false;
  showScheduleModal = false;
  showPrescriptionModal = false;
  isListening = false;
  isEditing = false;
  suggestedSpecialist = '';

  patientStats = { total: 0, emergency: 0, admitted: 0, discharged: 0 };

  nameError: boolean = false;
  contactError: boolean = false;

  newPatient = this.getEmptyPatient();

  scheduleData = {
    patientId: '',
    patientName: '',
    doctorName: '',
    reason: '',
    status: 'Waiting'
  };

  // Prescription data
  prescription: any = {
    patientName: '',
    patientId: '',
    patientAge: '',
    patientGender: '',
    doctorName: '',
    doctorSpecialty: '',
    date: '',
    diagnosis: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    labTests: '',
    advice: '',
    followUp: '',
    notes: ''
  };

  doctors: string[] = [];

  genderOptions = ['Male', 'Female', 'Other'];
  statusOptions = ['Stable', 'Critical', 'Recovering', 'In-treatment', 'Discharged'];

  frequencyOptions = [
    { label: 'Once daily (OD)', value: 'Once daily' },
    { label: 'Twice daily (BD)', value: 'Twice daily' },
    { label: 'Three times daily (TDS)', value: 'Three times daily' },
    { label: 'Four times daily (QID)', value: 'Four times daily' },
    { label: 'At bedtime (HS)', value: 'At bedtime' },
    { label: 'As needed (SOS)', value: 'As needed' }
  ];

  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService,
    private speechService: SpeechService,
    private socketService: SocketService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadPatients();
    this.loadAvailableDoctors();
    this.socketService.onPatientAdded().subscribe(() => this.loadPatients());
    this.socketService.onPatientUpdated().subscribe(() => this.loadPatients());
    this.socketService.onPatientDeleted().subscribe(() => this.loadPatients());
  }

  loadAvailableDoctors() {
    this.doctorService.getDoctors().subscribe({
      next: (docs) => {
        this.doctors = docs
          .filter(d => (d.status || '').toLowerCase() === 'available')
          .map(d => `${d.name} (${d.specialty})`);
        this.cd.markForCheck();
      },
      error: () => console.error('Failed to load available doctors')
    });
  }

  async listenToSymptoms() {
    this.isListening = true;
    try {
      const transcript = await this.speechService.startListening();
      this.newPatient.condition = transcript;
      this.suggestedSpecialist = this.speechService.getSpecialist(transcript);
      const match = this.doctors.find(d => d.includes(this.suggestedSpecialist));
      if (match) this.newPatient.suggestedDoctor = match;
    } catch (err) {
      console.error(err);
    } finally {
      this.isListening = false;
    }
  }

  analyzeSymptoms() {
    if (!this.newPatient.condition) return;
    const cond = this.newPatient.condition.toLowerCase();
    let spec = 'General Practitioner';
    if (cond.includes('heart') || cond.includes('chest') || cond.includes('blood pressure')) spec = 'Cardiology';
    else if (cond.includes('child') || cond.includes('fever') || cond.includes('baby') || cond.includes('kid')) spec = 'Pediatrics';
    else if (cond.includes('brain') || cond.includes('headache') || cond.includes('dizziness')) spec = 'Neurology';
    else if (cond.includes('skin') || cond.includes('rash') || cond.includes('itching')) spec = 'Dermatology';
    else if (cond.includes('bone') || cond.includes('joint') || cond.includes('fracture')) spec = 'Orthopedics';

    this.suggestedSpecialist = spec;
    const match = this.doctors.find(d => d.includes(spec));
    this.newPatient.suggestedDoctor = match || '';
    this.cd.markForCheck();
  }

  getEmptyPatient() {
    return { id: 'PT-' + (1000 + Math.floor(Math.random() * 9000)), name: '', age: 0, gender: 'Male', contact: '', condition: '', suggestedDoctor: '', status: 'Stable' };
  }

  resetPatient() { this.newPatient = this.getEmptyPatient(); }

  loadPatients() {
    this.patientService.getPatients().subscribe({
      next: (data) => {
        const patientsData = Array.isArray(data) ? data : [];
        this.searchTerm = '';
        this.patients = [...patientsData].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        this.filteredPatients = [...this.patients];
        this.calculateStats();
        this.cd.markForCheck();
        if (this.filteredPatients.length > 0) {
          if (!this.selectedPatient) this.selectedPatient = this.filteredPatients[0];
          else {
            const current = this.patients.find(p => p.id === this.selectedPatient.id);
            this.selectedPatient = current || this.filteredPatients[0];
          }
        }
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'API Error', detail: 'Registry sync error' })
    });
  }

  selectPatient(patient: any) { 
    this.selectedPatient = patient; 
    this.viewDossierModal = true;
  }

  calculateStats() {
    this.patientStats.total = this.patients.length;
    this.patientStats.admitted = this.patients.filter(p => !p.status || p.status.toLowerCase() !== 'discharged').length;
    this.patientStats.emergency = this.patients.filter(p => p.condition?.toLowerCase().includes('emergency') || p.condition?.toLowerCase().includes('critical')).length;
    this.patientStats.discharged = this.patients.filter(p => p.status?.toLowerCase() === 'discharged').length;
  }

  openAddModal() { this.isEditing = false; this.resetPatient(); this.showModal = true; }

  editPatient(patient: any) {
    this.isEditing = true;
    this.newPatient = { ...patient };
    this.nameError = false;
    this.contactError = false;
    this.showModal = true;
  }

  validateNameLive() {
    const nameRegex = /^[A-Za-z\s]+$/;
    this.nameError = !!(this.newPatient.name && !nameRegex.test(this.newPatient.name));
  }

  // validateContactLive1() {
  //   const phoneRegex = /^\d*$/;
  //   this.contactError = !!(this.newPatient.contact && !phoneRegex.test(this.newPatient.contact.toString()));
  // }

  validateContactLive() {
    const phoneRegex = /^\d{10}$/;
    const value = this.newPatient.contact;
    this.contactError = !!(value && !phoneRegex.test(value));
  }

  onlyDigits(event: KeyboardEvent) {
    const charCode = event.key;
    if (!/^[0-9]$/.test(charCode)) {
      event.preventDefault();
    }
  }



  validateForm() {
    const p = this.newPatient;
    if (!p.name || !p.age || !p.gender || !p.contact || !p.condition) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Data', detail: 'Please complete all required fields.' });
      return false;
    }
    if (!/^[A-Za-z\s]+$/.test(p.name)) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Name', detail: 'Patient name must contain only alphabets.' });
      return false;
    }
    if (!/^\d{10}$/.test(p.contact.toString())) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Number', detail: 'Contact number must be exactly 10 digits.' });
      return false;
    }
    return true;
  }

  savePatient() {
    if (!this.validateForm()) return;
    if (this.isEditing) {
      this.patientService.updatePatient(this.newPatient.id, this.newPatient).subscribe({
        next: () => { this.loadPatients(); this.showModal = false; this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record Updated Successfully' }); },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update sync failed.' })
      });
    } else {
      this.patientService.createPatient(this.newPatient).subscribe({
        next: (res) => { this.searchTerm = ''; this.loadPatients(); this.resetPatient(); this.selectedPatient = res; this.messageService.add({ severity: 'success', summary: 'Success', detail: 'New Patient Enrolled' }); },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to add patient.' })
      });
    }
  }

  onSearch() {
    const term = this.searchTerm ? this.searchTerm.trim().toLowerCase() : '';
    if (!term) { this.filteredPatients = [...this.patients]; return; }
    this.filteredPatients = this.patients.filter(p =>
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.id && p.id.toString().toLowerCase().includes(term))
    );
  }

  dischargePatient(patient: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to discharge <strong>${patient.name}</strong>?`,
      header: 'Discharge Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const updatedPatient = { ...patient, status: 'Discharged' };
        this.patientService.updatePatient(patient.id, updatedPatient).subscribe({
          next: () => { this.loadPatients(); this.messageService.add({ severity: 'info', summary: 'Discharged', detail: 'Patient status updated to Discharged.' }); },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status.' })
        });
      }
    });
  }

  openScheduleModal(patient: any) {
    this.scheduleData = { patientId: patient.id, patientName: patient.name, doctorName: patient.suggestedDoctor || '', reason: patient.condition || '', status: 'Waiting' };
    this.showScheduleModal = true;
  }

  confirmSchedule() {
    if (!this.scheduleData.doctorName) { this.messageService.add({ severity: 'warn', summary: 'Missing Doctor', detail: 'Please select a specialist.' }); return; }
    if (!this.scheduleData.reason) { this.messageService.add({ severity: 'warn', summary: 'Missing Reason', detail: 'Please enter a reason for visit.' }); return; }
    this.patientService.scheduleAppointment(this.scheduleData).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Booked', detail: `${this.scheduleData.patientName} added to queue.` }); this.showScheduleModal = false; },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Could not schedule.' })
    });
  }

  // ─── PRESCRIPTION METHODS ─────────────────────────────────────────────────

  openPrescription(patient: any) {
    const doctorName = patient.suggestedDoctor?.split('(')[0]?.trim() || '';
    const specialty = patient.suggestedDoctor?.split('(')[1]?.replace(')', '').trim() || '';
    const today = new Date();
    this.prescription = {
      patientName: patient.name,
      patientId: patient.id,
      patientAge: patient.age,
      patientGender: patient.gender,
      contact: patient.contact,
      doctorName: doctorName,
      doctorSpecialty: specialty,
      date: today.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      diagnosis: patient.condition || '',
      medicines: [{ name: '', dosage: '', frequency: 'Twice daily', duration: '', instructions: '' }],
      labTests: '',
      advice: '',
      followUp: '',
      notes: ''
    };
    this.showPrescriptionModal = true;
  }

  addMedicineRow() {
    this.prescription.medicines.push({ name: '', dosage: '', frequency: 'Once daily', duration: '', instructions: '' });
  }

  removeMedicineRow(index: number) {
    if (this.prescription.medicines.length > 1) {
      this.prescription.medicines.splice(index, 1);
    }
  }

  downloadPrescription() {
    const printContent = this.generatePrescriptionHTML();
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }

  private generatePrescriptionHTML(): string {
    const meds = this.prescription.medicines.map((m: any, i: number) => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${i + 1}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-weight:600;">${m.name || '—'}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${m.dosage || '—'}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${m.frequency || '—'}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${m.duration || '—'}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#64748b;">${m.instructions || ''}</td>
      </tr>`).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <title>Prescription - ${this.prescription.patientName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: white; }
    .prescription-page { max-width: 800px; margin: 0 auto; padding: 0; }
    @media print {
      .no-print { display: none !important; }
      body { margin: 0; }
      .prescription-page { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="prescription-page">
    <!-- Hospital Header -->
    <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;padding:24px 32px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;">🏥 City Care Hospital</div>
        <div style="font-size:12px;opacity:0.85;margin-top:4px;">Multi-Speciality & Trauma Centre</div>
        <div style="font-size:11px;opacity:0.75;margin-top:2px;">123 Medical Drive, Health City | Ph: +91 98765 43210</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:20px;font-weight:700;border:2px solid rgba(255,255,255,0.4);padding:6px 16px;border-radius:8px;">PRESCRIPTION</div>
        <div style="font-size:11px;opacity:0.8;margin-top:6px;">Rx No: RX-${Date.now().toString().slice(-6)}</div>
        <div style="font-size:11px;opacity:0.8;">Date: ${this.prescription.date}</div>
      </div>
    </div>

    <!-- Doctor & Patient Info -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:2px solid #e2e8f0;">
      <div style="padding:20px 24px;background:#f8fafc;border-right:1px solid #e2e8f0;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;font-weight:600;margin-bottom:10px;">Prescribing Doctor</div>
        <div style="font-size:18px;font-weight:700;color:#1e40af;">${this.prescription.doctorName || 'Dr. Attending Physician'}</div>
        <div style="font-size:12px;color:#3b82f6;font-weight:500;margin-top:2px;">${this.prescription.doctorSpecialty || 'General Medicine'}</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px;">MBBS, MD · City Care Hospital</div>
      </div>
      <div style="padding:20px 24px;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;font-weight:600;margin-bottom:10px;">Patient Information</div>
        <div style="font-size:17px;font-weight:700;color:#1e293b;">${this.prescription.patientName}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;">
          ID: <strong>${this.prescription.patientId}</strong> &nbsp;|&nbsp;
          Age: <strong>${this.prescription.patientAge} yrs</strong> &nbsp;|&nbsp;
          ${this.prescription.patientGender}
        </div>
        <div style="font-size:11px;color:#64748b;margin-top:4px;">Contact: ${this.prescription.contact || '—'}</div>
      </div>
    </div>

    <!-- Diagnosis -->
    <div style="padding:16px 24px;background:#eff6ff;border-bottom:1px solid #bfdbfe;">
      <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#1e40af;">Diagnosis / Chief Complaint:</span>
      <span style="font-size:14px;color:#1e293b;font-weight:600;margin-left:12px;">${this.prescription.diagnosis || '—'}</span>
    </div>

    <!-- Medicines Table -->
    <div style="padding:20px 24px;">
      <div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
        <span style="font-size:16px;">℞</span> Prescribed Medicines
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#1e40af;color:white;">
            <th style="padding:10px;text-align:left;width:30px;">#</th>
            <th style="padding:10px;text-align:left;">Medicine</th>
            <th style="padding:10px;text-align:left;width:90px;">Dosage</th>
            <th style="padding:10px;text-align:left;width:120px;">Frequency</th>
            <th style="padding:10px;text-align:left;width:90px;">Duration</th>
            <th style="padding:10px;text-align:left;">Instructions</th>
          </tr>
        </thead>
        <tbody>${meds}</tbody>
      </table>
    </div>

    ${this.prescription.labTests ? `
    <div style="padding:0 24px 16px;">
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#059669;margin-bottom:6px;">🔬 Investigations / Lab Tests</div>
        <div style="font-size:13px;color:#1e293b;">${this.prescription.labTests}</div>
      </div>
    </div>` : ''}

    ${this.prescription.advice ? `
    <div style="padding:0 24px 16px;">
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#d97706;margin-bottom:6px;">💡 General Advice</div>
        <div style="font-size:13px;color:#1e293b;">${this.prescription.advice}</div>
      </div>
    </div>` : ''}

    <!-- Follow Up & Signature -->
    <div style="padding:16px 24px;border-top:2px solid #e2e8f0;display:flex;justify-content:space-between;align-items:flex-end;">
      <div>
        ${this.prescription.followUp ? `<div style="font-size:12px;color:#64748b;">Follow-up: <strong style="color:#1e293b;">${this.prescription.followUp}</strong></div>` : ''}
        ${this.prescription.notes ? `<div style="font-size:11px;color:#94a3b8;margin-top:4px;">Notes: ${this.prescription.notes}</div>` : ''}
      </div>
      <div style="text-align:center;">
        <div style="width:180px;border-bottom:2px solid #1e293b;margin-bottom:6px;height:40px;"></div>
        <div style="font-size:12px;font-weight:700;color:#1e293b;">${this.prescription.doctorName || 'Doctor Signature'}</div>
        <div style="font-size:10px;color:#64748b;">${this.prescription.doctorSpecialty || 'Designation'}</div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#1e293b;color:rgba(255,255,255,0.6);text-align:center;padding:10px;font-size:10px;">
      City Care Hospital · This is a computer-generated prescription · Valid for 30 days from date of issue
    </div>
  </div>
</body>
</html>`;
  }

  getStatusClass(status: string) {
    if (!status) return 'status-stable';
    switch (status.toLowerCase()) {
      case 'in-treatment': return 'status-treatment';
      case 'stable': return 'status-stable';
      case 'recovering': return 'status-recovering';
      case 'discharged': return 'status-discharged';
      case 'critical': return 'status-critical';
      default: return 'status-stable';
    }
  }

  getStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    if (!status) return 'info';
    switch (status.toLowerCase()) {
      case 'stable': return 'success';
      case 'recovering': return 'info';
      case 'in-treatment': return 'warn';
      case 'critical': return 'danger';
      case 'discharged': return 'secondary';
      default: return 'info';
    }
  }

  getStatusColor(status: string): string {
    if (!status) return '#3b82f6';
    switch (status.toLowerCase()) {
      case 'stable': return '#10b981';
      case 'recovering': return '#3b82f6';
      case 'in-treatment': return '#f59e0b';
      case 'critical': return '#ef4444';
      case 'discharged': return '#64748b';
      default: return '#3b82f6';
    }
  }
}


