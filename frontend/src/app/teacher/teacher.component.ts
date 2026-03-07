import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Teacher } from '../model/teacher.model';
import { TeacherService } from './teacher.service';
import { UploadService } from '../services/upload/upload.service';

@Component({
    selector: 'app-teacher',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './teacher.component.html',
    styleUrls: ['./teacher.component.scss']
})
export class TeacherComponent implements OnInit {
    teachers: Teacher[] = [];
    viewMode: 'table' | 'card' = 'table';
    teacherForm: FormGroup;
    showAddModal: boolean = false;
    isEditMode: boolean = false;
    currentTeacherId: string = '';
    
    selectedFile: File | null = null;
    previewUrl: string | null = null;
    isUploading: boolean = false;

    constructor(
        private teacherService: TeacherService,
        private uploadService: UploadService
    ) {
        this.teacherForm = new FormGroup({
            id: new FormControl('', [Validators.required, Validators.maxLength(6)]),
            name: new FormControl('', [Validators.required, Validators.minLength(3)]),
            department: new FormControl('', Validators.required),
            picture: new FormControl('', Validators.required), // URL string is set implicitly
            username: new FormControl('', Validators.required),
            password: new FormControl('') // Make password optional in logic, enforce in UI if new
        });
    }

    ngOnInit(): void {
        this.loadTeachers();
    }

    loadTeachers(): void {
        this.teacherService.getTeachers().subscribe({
            next: (data) => this.teachers = data,
            error: (err) => console.error('Error fetching teachers', err)
        });
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.teacherForm.get('picture')?.setValue('pending'); // Mark as temporarily valid

            // Create a preview URL
            const reader = new FileReader();
            reader.onload = () => {
                this.previewUrl = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    openDialog(teacher?: Teacher): void {
        this.teacherForm.reset();
        this.selectedFile = null;
        this.previewUrl = null;
        
        if (teacher) {
            this.isEditMode = true;
            this.currentTeacherId = teacher.id;
            this.teacherForm.patchValue({
                id: teacher.id,
                name: teacher.name,
                department: teacher.department,
                picture: teacher.picture,
                username: teacher.username
            });
            this.teacherForm.get('id')?.disable();
            this.teacherForm.get('username')?.disable();
            this.teacherForm.get('password')?.clearValidators();
        } else {
            this.isEditMode = false;
            this.currentTeacherId = '';
            this.teacherForm.get('id')?.enable();
            this.teacherForm.get('username')?.enable();
            this.teacherForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        }
        this.teacherForm.get('password')?.updateValueAndValidity();
        this.showAddModal = true;
    }

    closeDialog(): void {
        this.showAddModal = false;
    }

    onSubmit(): void {
        if (this.teacherForm.invalid) {
            this.teacherForm.markAllAsTouched();
            alert('Please fill in all required fields correctly');
            return;
        }

        this.isUploading = true;

        if (this.selectedFile) {
            this.uploadService.uploadFile(this.selectedFile).subscribe({
                next: (res) => {
                    this.teacherForm.get('picture')?.setValue(res.fullPath);
                    this.saveTeacher();
                },
                error: (err) => {
                    this.isUploading = false;
                    alert('Error uploading file. ' + (err.error?.error || err.message));
                }
            });
        } else {
            this.saveTeacher();
        }
    }

    private saveTeacher(): void {
        const formValue = this.teacherForm.getRawValue();

        const teacherData: Teacher = {
            id: formValue.id,
            name: formValue.name,
            department: formValue.department,
            picture: formValue.picture,
            username: formValue.username,
            password: formValue.password
        };

        if (this.isEditMode) {
            const { password, ...updateData } = teacherData;
            this.teacherService.updateTeacher(updateData).subscribe({
                next: () => {
                    this.isUploading = false;
                    this.loadTeachers();
                    this.closeDialog();
                },
                error: (err) => {
                    this.isUploading = false;
                    alert('Error updating teacher');
                }
            });
        } else {
            this.teacherService.addTeacher(teacherData).subscribe({
                next: () => {
                    this.isUploading = false;
                    this.loadTeachers();
                    this.closeDialog();
                },
                error: (err) => {
                    this.isUploading = false;
                    if (err.status === 409) {
                        alert('Teacher ID or Username already exists');
                    } else {
                        alert('Error creating teacher');
                    }
                }
            });
        }
    }

    deleteTeacher(): void {
        if (confirm('Are you sure you want to delete this teacher?')) {
            this.teacherService.deleteTeacher(this.currentTeacherId).subscribe({
                next: () => {
                    this.loadTeachers();
                    this.closeDialog();
                },
                error: (err) => alert('Error deleting teacher')
            });
        }
    }
}
