import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Activity, CreateActivityRequest, UpdateActivityRequest } from '../models/activity.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ActivitiesService {
  private readonly apiUrl = environment.apiUrl + '/activities';
  // private readonly apiURL = 'http://localhost:3000/activities';
  private http = inject(HttpClient);

  getActivitiesByTrip(tripId: string): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/trip/${tripId}`);
  };

  getActivityById(id: string): Observable<Activity> {
    return this.http.get<Activity>(`${this.apiUrl}/${id}`);
  };

  createActivity(data: CreateActivityRequest): Observable<Activity> {
    return this.http.post<Activity>(this.apiUrl, data);
  };

  updateActivity(id: string, data: UpdateActivityRequest): Observable<Activity> {
    return this.http.put<Activity>(`${this.apiUrl}/${id}`, data);
  };

  deleteActivity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
