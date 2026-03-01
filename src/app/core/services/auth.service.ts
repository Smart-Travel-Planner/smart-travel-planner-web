import { jwtDecode, JwtPayload } from 'jwt-decode';
// import { jwtDecode, JwtPayload } from './../../../../node_modules/jwt-decode/build/cjs/index.d';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../../features/auth/auth.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/auth';
  private readonly tokenKey = 'access_token';

  constructor(private http: HttpClient, private router: Router) {}

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => this.saveToken(response.access_token))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.sub ?? null;
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }
}
