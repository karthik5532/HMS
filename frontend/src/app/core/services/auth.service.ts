import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:5001/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: { username: string, password: any }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res));
        }
      })
    );
  }

  register(userData: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken() {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') return null;
    return token;
  }

  getUser() {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}
