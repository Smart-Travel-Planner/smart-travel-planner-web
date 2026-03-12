import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MapService } from './map.service';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeocodingService {
  private http = inject(HttpClient);
  private mapService = inject(MapService);

  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
  private readonly DEFAULT_COORDS = { lat: 41.40237282641176, lng: 2.194541858893481 };

  getCoordsByDestination(destination: string): Observable<{ lat: number; lng: number}> {
    return this.http.get<any[]>(this.NOMINATIM_URL, {
      params: {
        q: destination,
        format: 'json',
        limit: '1',
      },
      headers: {
        'Accept-Language': 'es',
      },
    }).pipe(
        map(results => {
          if (results && results.length > 0) {
            return {
              lat: parseFloat(results[0].lat),
              lng: parseFloat(results[0].lon),
            };
          };
          return this.DEFAULT_COORDS;
        }),
        catchError(() => of(this.DEFAULT_COORDS))
    );
  };

  getUserLocationOrDefault(): Promise<{ lat: number; lng: number }> {
    return this.mapService.getUserLocation()
      .catch(() => this.DEFAULT_COORDS);
  };
};
