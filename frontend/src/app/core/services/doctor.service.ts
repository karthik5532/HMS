import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = 'http://127.0.0.1:5001/api/doctors';

  constructor(private http: HttpClient) {}

  getDoctors(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  getDoctor(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  createDoctor(doctor: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, doctor);
  }

  updateDoctor(id: string, doctor: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, doctor);
  }

  deleteDoctor(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
