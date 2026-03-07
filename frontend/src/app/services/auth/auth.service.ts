import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { AUTH_KEYS } from './auth.constants';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private cookieService = inject(CookieService);

  constructor(private http: HttpClient) { }

  login(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/teacher/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          this.cookieService.set(AUTH_KEYS.TOKEN, response.token, 1, '/');
        }
        if (response.data) {
          this.cookieService.set(AUTH_KEYS.USER_DATA, JSON.stringify(response.data), 1, '/');
        }
      })
    );
  }

  isAuthenticated(): boolean {
    return this.cookieService.check(AUTH_KEYS.TOKEN);
  }

  logout(): void {
    this.cookieService.delete(AUTH_KEYS.TOKEN, '/');
    this.cookieService.delete(AUTH_KEYS.USER_DATA, '/');
  }

  getCurrentUserId(): string | null {
    const userDataStr = this.cookieService.get(AUTH_KEYS.USER_DATA);
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        return userData.id || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}
