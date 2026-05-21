import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LabService {
  private apiUrl = 'http://127.0.0.1:5001/api/labs';

  constructor(private http: HttpClient) {}

  getReports(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  createReport(report: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, report);
  }

  updateReport(id: string, report: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, report);
  }

  deleteReport(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
