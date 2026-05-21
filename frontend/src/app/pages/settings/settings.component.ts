import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  hospitalInfo = {
    name: 'City Care Hospitals',
    address: '123 Medical Drive, Health City',
    contact: '+1 (555) 000-0000',
    email: 'contact@citycare.com'
  };
}
