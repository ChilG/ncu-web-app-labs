import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TeacherService } from '../teacher/teacher.service';
import { AuthService } from '../services/auth/auth.service';

// Custom validator to check if passwords match
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  
  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
};

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private teacherService: TeacherService,
    private authService: AuthService,
    private router: Router
  ) {
    this.passwordForm = new FormGroup({
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      this.errorMessage = 'Active user session not found. Please log in again.';
      this.isLoading = false;
      return;
    }

    const formValues = this.passwordForm.value;

    this.teacherService.changePassword(
      currentUserId, 
      formValues.oldPassword, 
      formValues.newPassword
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Password changed successfully! You will be logged out in 3 seconds.';
        this.passwordForm.reset();
        
        // Log out user after a few seconds so they can test the new password
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
             this.errorMessage = 'Incorrect current password.';
        } else {
             this.errorMessage = err.error?.error || 'An error occurred while changing the password.';
        }
      }
    });
  }
}
