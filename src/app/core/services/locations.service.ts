import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateLocationRequest, TripLocation, UpdateLocationRequest } from '../models/location.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private readonly apiUrl = environment.apiUrl + '/locations';
  private http = inject(HttpClient);

  getLocations(): Observable<TripLocation[]> {
    return this.http.get<TripLocation[]>(this.apiUrl);
  };

  getLocationById(id: string): Observable<TripLocation> {
    return this.http.get<TripLocation>(`${this.apiUrl}/${id}`);
  };

  createLocation(data: CreateLocationRequest): Observable<TripLocation> {
    return this.http.post<TripLocation>(this.apiUrl, data);
  };

  updateLocation(id: string, data: UpdateLocationRequest): Observable<TripLocation> {
    return this.http.put<TripLocation>(`${this.apiUrl}/${id}`, data);
  };

  deleteLocation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  };
}
