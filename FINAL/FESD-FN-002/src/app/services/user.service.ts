import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) { }

  // Get all users
  getUsers(): Observable<User[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(users => users.map(u => new User(u))) // Map raw objects to User class instances so getAge() is available
    );
  }

  // Create new user
  createUser(userData: Partial<User>): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData);
  }
}
