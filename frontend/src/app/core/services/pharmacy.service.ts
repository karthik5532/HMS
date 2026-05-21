import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PharmacyService {
  private apiUrl = 'http://127.0.0.1:5001/api/pharmacy';

  constructor(private http: HttpClient) {}

  getMedicines(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  createMedicine(medicine: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, medicine);
  }

  updateMedicine(id: string, medicine: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, medicine);
  }

  deleteMedicine(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
