import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateLocationRequest, TripLocation, UpdateLocationRequest } from '../models/location.model';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private readonly apiURL = 'http://localhost:3000/locations';
  private http = inject(HttpClient);

  getLocations(): Observable<TripLocation[]> {
    return this.http.get<TripLocation[]>(this.apiURL);
  };

  getLocationById(id: string): Observable<TripLocation> {
    return this.http.get<TripLocation>(`${this.apiURL}/${id}`);
  };

  createLocation(data: CreateLocationRequest): Observable<TripLocation> {
    return this.http.post<TripLocation>(this.apiURL, data);
  };

  updateLocation(id: string, data: UpdateLocationRequest): Observable<TripLocation> {
    return this.http.put<TripLocation>(`${this.apiURL}/${id}`, data);
  };

  deleteLocation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  };
}
