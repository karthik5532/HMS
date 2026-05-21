import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'http://127.0.0.1:5001/api/patients';

  constructor(private http: HttpClient) {}

  getPatients(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createPatient(patient: any): Observable<any> {
    return this.http.post(this.apiUrl, patient);
  }

  updatePatient(id: string, patient: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, patient);
  }

  deletePatient(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  scheduleAppointment(appointment: any): Observable<any> {
    return this.http.post('http://127.0.0.1:5001/api/queue', appointment);
  }
}
