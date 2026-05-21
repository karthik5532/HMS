import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, InputTextModule, PasswordModule, ButtonModule, CardModule, MessageModule, SelectModule, IconFieldModule, InputIconModule, RippleModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  userData = {
    name: '',
    username: '',
    password: '',
    role: 'Doctor'
  };

  roleOptions = [
    { label: 'Doctor', value: 'Doctor' },
    { label: 'Admin', value: 'Admin' }
  ];
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  onSubmit() {
    console.log('Attempting registration with:', this.userData);
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.register(this.userData).subscribe({
      next: (res: any) => {
        console.log('Registration successful:', res);
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res));
          
          if (res.role === 'Doctor') {
            this.router.navigate(['/doctor-dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      },
      error: (err) => {
        console.error('Registration failed error details:', err);
        this.errorMessage = err.error?.message || 'Registration failed. Please check your data and try again.';
        this.isLoading = false;
      }
    });
  }
}
