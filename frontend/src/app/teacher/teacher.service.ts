import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Teacher } from '../model/teacher.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TeacherService {
    private apiUrl = `${environment.apiUrl}/teacher`;

    constructor(private http: HttpClient) {}

    getTeachers(): Observable<Teacher[]> {
        return this.http.get<{ data: Teacher[] }>(this.apiUrl).pipe(
            map(response => response.data)
        );
    }

    getTeacherById(id: string): Observable<Teacher> {
        return this.http.get<Teacher>(`${this.apiUrl}/${id}`);
    }

    addTeacher(teacher: Teacher): Observable<Teacher> {
        return this.http.post<Teacher>(this.apiUrl, teacher);
    }

    updateTeacher(teacher: Teacher): Observable<Teacher> {
        return this.http.put<Teacher>(`${this.apiUrl}/${teacher.id}`, teacher);
    }

    deleteTeacher(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    changePassword(id: string, oldPassword: string, newPassword: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/password`, { oldPassword, newPassword });
    }
}
