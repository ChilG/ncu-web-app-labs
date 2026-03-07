import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student } from '../model/student.model';
import { StudentService } from './student.service';

@Component({
    selector: 'app-student',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './student.component.html',
    styleUrls: ['./student.component.scss']
})
export class StudentComponent implements OnInit {
    students: Student[] = [];
    viewMode: 'table' | 'card' = 'table';
    currentStudent: Student = { id: '', name: '', age: 0, email: '', major: '' };
    showAddModal: boolean = false;
    isEditMode: boolean = false;

    constructor(private studentService: StudentService) { }

    ngOnInit(): void {
        this.loadStudents();
    }

    loadStudents(): void {
        this.studentService.getStudents().subscribe({
            next: (data) => this.students = data,
            error: (err) => console.error('Error fetching students', err)
        });
    }

    openDialog(student?: Student): void {
        if (student) {
            this.isEditMode = true;
            this.currentStudent = { ...student };
        } else {
            this.isEditMode = false;
            this.currentStudent = { id: '', name: '', age: 0, email: '', major: '' };
        }
        this.showAddModal = true;
    }

    closeDialog(): void {
        this.showAddModal = false;
    }

    onSubmit(): void {
        if (this.currentStudent.name && this.currentStudent.email) {
            if (this.isEditMode) {
                this.studentService.updateStudent(this.currentStudent).subscribe({
                    next: () => {
                        this.loadStudents();
                        this.closeDialog();
                    },
                    error: (err) => alert('Error updating student')
                });
            } else {
                this.studentService.addStudent({ ...this.currentStudent }).subscribe({
                    next: () => {
                        this.loadStudents();
                        this.closeDialog();
                    },
                    error: (err) => {
                         if (err.status === 409) {
                            alert('Student email already exists');
                        } else {
                            alert('Error creating student');
                        }
                    }
                });
            }
        } else {
            alert('Please fill in Name and Email');
        }
    }

    deleteStudent(): void {
        if (confirm('Are you sure you want to delete this student?')) {
            this.studentService.deleteStudent(this.currentStudent.id).subscribe({
                next: () => {
                    this.loadStudents();
                    this.closeDialog();
                },
                error: (err) => alert('Error deleting student')
            });
        }
    }
}
