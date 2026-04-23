import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, of, switchMap } from 'rxjs';
import { TripsService } from '../../../../core/services/trips.service';
import { LocationsService } from '../../../../core/services/locations.service';
import { ActivitiesService } from '../../../../core/services/activities.service';
import { UsersService } from '../../../../core/services/user.service';
import { AiService } from '../../../../core/services/ai.service';
import { GeocodingService } from '../../../../core/services/geocoding.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Trip } from '../../../../core/models/trip.model';
import { TripLocation } from '../../../../core/models/location.model';
import { Activity } from '../../../../core/models/activity.model';
import { TravelRequirement } from '../../../../core/models/travel-requirement.model';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class TripDetailFacade {
  private tripsService = inject(TripsService);
  private locationsService = inject(LocationsService);
  private activitiesService = inject(ActivitiesService);
  private usersService = inject(UsersService);
  private aiService = inject(AiService);
  private geocodingService = inject(GeocodingService);
  private authService = inject(AuthService);
private destroyRef = inject(DestroyRef);

  private _trip = signal<Trip | null>(null);
  private _locations = signal<TripLocation[]>([]);
  private _activities = signal<Activity[]>([]);
  private _creatorName = signal<string | null>(null);
  private _requirements = signal<TravelRequirement | null>(null);
  private _errorMessage = signal<string>('');

  trip = this._trip.asReadonly();
  locations = this._locations.asReadonly();
  activities = this._activities.asReadonly();
  creatorName = this._creatorName.asReadonly();
  requirements = this._requirements.asReadonly();
  errorMessage = this._errorMessage.asReadonly();

  isOwner = computed(() => {
    const trip = this._trip();
    if (!trip) return false;
    return trip.user_id === this.authService.getCurrentUserId();
  });

  locationMap = computed(() => {
    const map = new Map<string, string>();
    this._locations().forEach(loc => map.set(loc.id, loc.name));
    return map;
  });

  tripDestinationCoords = toSignal(
    toObservable(computed(() => this._trip()?.destination)).pipe(
      filter(() => this._trip() !== null),
      switchMap(destination =>
        this.geocodingService.getDestinationOrUserCoords(destination)
      )
    )
  );

  load(tripId: string): void {
    this.loadTrip(tripId);
    this.loadLocations();
    this.loadActivities(tripId);
  }

  private loadTrip(id: string): void {
    this.tripsService.getTripById(id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: trip => {
        this._trip.set(trip);
        if (trip.is_public && trip.user_id !== this.authService.getCurrentUserId()) {
          this.loadCreatorName(trip.user_id);
        }
        this.loadRequirements(id);
      },
      error: () => this._errorMessage.set('Error cargando el viaje'),
    });
  }

  private loadCreatorName(userId: string): void {
    this.usersService.getPublicProfile(userId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: profile => this._creatorName.set(profile.name),
      error: () => this._creatorName.set(null),
    });
  }

  private loadLocations(): void {
    this.locationsService.getLocations().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: locations => this._locations.set(locations),
      error: () => {},
    });
  }

  private loadRequirements(tripId: string): void {
    this.tripsService.getTravelRequirements(tripId).pipe(
      catchError(() => {
        if (!this.isOwner()) return of(null);
        const destination = this._trip()?.destination;
        if (!destination) return of(null);
        return this.aiService.generateRequirements(destination).pipe(
          takeUntilDestroyed(this.destroyRef),
          switchMap(generated =>
            this.tripsService.createTravelRequirements({
              trip_id: tripId,
              ...generated,
            })
          ),
          catchError(() => {
            console.warn('Error generando o guardando requisitos con la IA');
            return of(null);
          })
        );
      })
    ).subscribe({
      next: reqs => {
        if (reqs) this._requirements.set(reqs);
      },
    });
  }

  private loadActivities(tripId: string): void {
    this.activitiesService.getActivitiesByTrip(tripId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: activities => this._activities.set(activities),
      error: () => this._errorMessage.set('Error cargando las actividades'),
    });
  }

  deleteTrip(id: string): void {
    this.tripsService.deleteTrip(id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {},
      error: () => this._errorMessage.set('Error eliminando el viaje'),
    });
  }
}
