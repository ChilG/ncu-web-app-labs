import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  
  // Alert Status
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      userEmail: ['', [Validators.required, Validators.email]],
      userPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
      userFirstName: ['', Validators.required],
      userLastName: ['', Validators.required],
      userTel: ['', [Validators.required, Validators.pattern('^[0-9]+$')]], // Assuming telephone is digits
      dateOfBirth: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]] // YYYY-MM-DD
    });
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.registrationForm.valid) {
      this.userService.createUser(this.registrationForm.value).subscribe({
        next: (res) => {
          this.successMessage = 'Registration successful! (201 Created)';
          this.registrationForm.reset();
        },
        error: (err) => {
          if (err.status === 409 || err.status === 422) {
            this.errorMessage = 'Email is already registered! (422/409)';
          } else if (err.status === 400) {
            this.errorMessage = 'Invalid data provided! (400)';
          } else {
            this.errorMessage = 'Server / Script Error (500)';
          }
        }
      });
    } else {
      this.registrationForm.markAllAsTouched();
    }
  }

  // Auto-format date input to YYYY-MM-DD
  onDateInput(event: any): void {
    let input = event.target.value.replace(/\D/g, '').substring(0, 8); // Keep only numbers, max 8 digits
    let formatted = input;
    
    if (input.length > 4) {
      formatted = input.substring(0, 4) + '-' + input.substring(4);
    }
    if (input.length > 6) {
      formatted = formatted.substring(0, 7) + '-' + input.substring(6);
    }
    
    this.registrationForm.get('dateOfBirth')?.setValue(formatted, { emitEvent: false });
  }
}
