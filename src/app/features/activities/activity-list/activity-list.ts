
import { MatIconModule } from '@angular/material/icon';
import { Component, inject, OnInit, signal } from '@angular/core';
import { LocationsService } from '../../../core/services/locations.service';
import { TripLocation } from '../../../core/models/location.model';
import { TripsService } from '../../../core/services/trips.service';
import { GeocodingService } from '../../../core/services/geocoding.service';
import { Trip } from '../../../core/models/trip.model';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button';
import { NavigationService } from '../../../core/services/navigation.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ActivityMapListComponent } from '../../../shared/components/activity-map-list/activity-map-list';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-activity-list',
  imports: [MatIconModule, BackButtonComponent, ActivityMapListComponent],
  templateUrl: './activity-list.html',
  styleUrl: './activity-list.css',
})
export class ActivityListComponent implements OnInit {
  private locationsService = inject(LocationsService);
  private tripsService = inject(TripsService);
  private geocodingService = inject(GeocodingService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private navigationService = inject(NavigationService);
  private destroyRef = inject(DestroyRef);

  locations = signal<TripLocation[]>([]);
  tripId = signal<string>('');
  errorMessage = signal<string>('');
  tripDestinationCoords = signal<{ lat: number; lng: number } | undefined>(undefined);
  trip = signal<Trip | null>(null);

  ngOnInit(): void {
    const tripId = this.route.snapshot.paramMap.get('tripId');
    if (!tripId) {
      this.router.navigate(['/trips']);
      return;
    }
    this.tripId.set(tripId);
    this.loadLocations();
    this.loadTripDestination(tripId);
    window.scrollTo(0, 0);
  }

  private loadLocations(): void {
    this.locationsService.getLocations().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: locations => this.locations.set(locations),
      error: () => this.errorMessage.set('Error cargando las ubicaciones'),
    });
  };

  private loadTripDestination(tripId: string): void {
    this.tripsService.getTripById(tripId).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(trip => {
        this.trip.set(trip);
        return this.geocodingService.getDestinationOrUserCoords(trip.destination);
      })
    ).subscribe({
      next: coords => this.tripDestinationCoords.set(coords),
    });
  }

  goToEditActivity(id: string): void {
    this.navigationService.setPreviousUrl(`/trips/${this.tripId()}/activities`);
    this.router.navigate(['/trips', this.tripId(), 'activities', id, 'edit']);
  };

  goToCreate(): void {
    this.navigationService.setPreviousUrl(`/trips/${this.tripId()}/activities`);
    this.router.navigate(['/trips', this.tripId(), 'activities', 'new']);
  };

  goBack(): void {
    this.router.navigate([this.navigationService.getPreviousUrl()]);
  };
};
