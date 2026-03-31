import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Activity, CreateActivityRequest, UpdateActivityRequest } from '../models/activity.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ActivitiesService {
  private readonly apiUrl = environment.apiUrl + '/activities';
  private http = inject(HttpClient);

  private _activities = signal<Activity[]>([]);
  private _loading = signal<boolean>(false);
  private _errorMessage = signal<string | null>(null);

  activities = this._activities.asReadonly();
  loading = this._loading.asReadonly();
  errorMessage = this._errorMessage.asReadonly();

  mapFilteredActivities = computed(() => {
    const allActivities = this._activities();
      return allActivities;
  });

  eventsCount = computed(() => this._activities().length);

  loadEvents(): void {
    this._loading.set(true);
    this._errorMessage.set(null);

    this.http.get<Activity[]>(this.apiUrl).subscribe({
      next: (events) => {
        this._activities.set(events);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this._errorMessage.set('Error al cargar los eventos');
        this._loading.set(false);
      }
    });
  };

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
  };
}
