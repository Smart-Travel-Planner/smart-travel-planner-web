import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip, CreateTripRequest, UpdateTripRequest } from '../models/trip.model';
import { environment } from '../../environments/environment';
import { TravelRequirement } from '../models/travel-requirement.model';

@Injectable({
  providedIn: 'root'
})
export class TripsService {
  private readonly apiUrl = environment.apiUrl + '/trips';
  // private readonly apiUrl = 'http://localhost:3000/trips';

  constructor(private http: HttpClient) {}

  getMyTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.apiUrl}/my-trips`);
  }

  getPublicTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.apiUrl}/public`);
  }

  getTripById(id: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.apiUrl}/${id}`);
  }

  getTravelRequirements(tripId: string): Observable<TravelRequirement> {
    return this.http.get<TravelRequirement>(`${this.apiUrl}/${tripId}/requirements`);
  }
  
  createTrip(data: CreateTripRequest): Observable<Trip> {
    return this.http.post<Trip>(this.apiUrl, data);
  }

  updateTrip(id: string, data: UpdateTripRequest): Observable<Trip> {
    return this.http.put<Trip>(`${this.apiUrl}/${id}`, data);
  }

  deleteTrip(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
