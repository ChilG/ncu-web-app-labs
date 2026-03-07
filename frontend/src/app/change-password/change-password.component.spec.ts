import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangePasswordComponent } from './change-password.component';
import { TeacherService } from '../teacher/teacher.service';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;
  let mockTeacherService: jasmine.SpyObj<TeacherService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    mockTeacherService = jasmine.createSpyObj('TeacherService', ['changePassword']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUserId', 'logout']);

    await TestBed.configureTestingModule({
      imports: [ChangePasswordComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should invalidate form when passwords do not match', () => {
    component.passwordForm.patchValue({
      oldPassword: 'oldPass123',
      newPassword: 'newPassword123!',
      confirmPassword: 'differentPassword123!'
    });
    
    expect(component.passwordForm.hasError('passwordMismatch')).toBeTrue();
    expect(component.passwordForm.valid).toBeFalse();
  });

  it('should validate form when passwords match', () => {
    component.passwordForm.patchValue({
      oldPassword: 'oldPass123',
      newPassword: 'newPassword123!',
      confirmPassword: 'newPassword123!'
    });
    
    expect(component.passwordForm.hasError('passwordMismatch')).toBeFalse();
    expect(component.passwordForm.valid).toBeTrue();
  });

  it('should handle missing active user session', () => {
    component.passwordForm.patchValue({
      oldPassword: 'oldPass123',
      newPassword: 'newPassword123!',
      confirmPassword: 'newPassword123!'
    });
    
    mockAuthService.getCurrentUserId.and.returnValue(null);
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Active user session not found. Please log in again.');
    expect(mockTeacherService.changePassword).not.toHaveBeenCalled();
  });

  it('should change password successfully', () => {
    component.passwordForm.patchValue({
      oldPassword: 'oldPass123',
      newPassword: 'newPassword123!',
      confirmPassword: 'newPassword123!'
    });
    
    mockAuthService.getCurrentUserId.and.returnValue('T123');
    mockTeacherService.changePassword.and.returnValue(of({ message: 'Success' }));
    
    component.onSubmit();
    
    expect(component.successMessage).toContain('Password changed successfully');
    expect(mockTeacherService.changePassword).toHaveBeenCalledWith('T123', 'oldPass123', 'newPassword123!');
  });

  it('should handle API errors when changing password', () => {
    component.passwordForm.patchValue({
      oldPassword: 'wrongOldPassword',
      newPassword: 'newPassword123!',
      confirmPassword: 'newPassword123!'
    });
    
    mockAuthService.getCurrentUserId.and.returnValue('T123');
    mockTeacherService.changePassword.and.returnValue(throwError(() => ({ status: 401 })));
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Incorrect current password.');
  });
});
