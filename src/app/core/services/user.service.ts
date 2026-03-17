import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly apiUrl = environment.apiUrl + '/users';
  private http = inject(HttpClient);

  getPublicProfile(id: string): Observable<{ id: string; name: string }> {
    return this.http.get<{ id: string; name: string }>(`${this.apiUrl}/${id}/public`);
  }
}
