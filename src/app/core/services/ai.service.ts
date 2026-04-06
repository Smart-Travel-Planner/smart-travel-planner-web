import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TravelRequirement } from '../models/travel-requirement.model';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly apiUrl = environment.apiUrl + '/ai';

  constructor(private http: HttpClient) {}

  generateRequirements(destination: string): Observable<Omit<TravelRequirement, 'id' | 'trip_id' | 'last_updated'>> {
    return this.http.post<Omit<TravelRequirement, 'id' | 'trip_id' | 'last_updated'>>(
      `${this.apiUrl}/generate-requirements`,
      { destination }
    );
  }
}
