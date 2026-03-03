import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateLocationRequest, UpdateLocationRequest } from '../models/location.model';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private readonly apiURL = 'http://localhost:3000/locations';
  private http = inject(HttpClient);

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(this.apiURL);
  };

  getLocationById(id: string): Observable<Location> {
    return this.http.get<Location>(`${this.apiURL}/${id}`);
  };

  createLocation(data: CreateLocationRequest): Observable<Location> {
    return this.http.post<Location>(this.apiURL, data);
  };

  updateLocation(id: string, data: UpdateLocationRequest): Observable<Location> {
    return this.http.put<Location>(`${this.apiURL}/${id}`, data);
  };

  deleteLocation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  };
}
