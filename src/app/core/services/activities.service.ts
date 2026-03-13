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
  // private readonly apiURL = 'http://localhost:3000/activities';
  private http = inject(HttpClient);

  private _activities = signal<Activity[]>([]);
  private _loading = signal<boolean>(false);
  private _errorMessage = signal<string | null>(null);
  // private _selectedHobby = signal<string>('');

  // selectedHobby = this._selectedHobby.asReadonly();
  activities = this._activities.asReadonly();
  loading = this._loading.asReadonly();
  errorMessage = this._errorMessage.asReadonly();

  mapFilteredActivities = computed(() => {
    const allActivities = this._activities();
    // const filterValue = this._selectedHobby();

    // if (!filterValue || filterValue === '') {
      return allActivities;
    // }

    // return allActivities.filter(e => {
    //   if (!e.category) return false;

    //   return String(e.category).trim() === String(filterValue).trim();
    // });
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
  }



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
