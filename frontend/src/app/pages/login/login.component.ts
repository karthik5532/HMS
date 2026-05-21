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
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, InputTextModule, PasswordModule, ButtonModule, CardModule, MessageModule, IconFieldModule, InputIconModule, RippleModule, AvatarModule, BadgeModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.username && this.password) {
      this.isLoading = true;
      this.errorMessage = '';
      this.authService.login({ username: this.username, password: this.password }).subscribe({
        next: (res) => {
          if (res.role === 'Doctor') {
            this.router.navigate(['/doctor-dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Login failed. Please try again.';
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Please enter both username and password';
    }
  }
}
