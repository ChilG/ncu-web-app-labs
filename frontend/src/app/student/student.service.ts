import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Student } from '../model/student.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StudentService {
    private apiUrl = `${environment.apiUrl}/student`;

    constructor(private http: HttpClient) {}

    getStudents(): Observable<Student[]> {
        return this.http.get<{ data: Student[] }>(this.apiUrl).pipe(
            map(response => response.data)
        );
    }

    getStudentById(id: string): Observable<Student> {
        return this.http.get<Student>(`${this.apiUrl}/${id}`);
    }

    addStudent(student: Student): Observable<Student> {
        return this.http.post<Student>(this.apiUrl, student);
    }

    updateStudent(student: Student): Observable<Student> {
        return this.http.put<Student>(`${this.apiUrl}/${student.id}`, student);
    }

    deleteStudent(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
