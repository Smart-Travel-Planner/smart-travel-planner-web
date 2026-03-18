import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivitiesService } from '../../../core/services/activities.service';
import { LocationsService } from '../../../core/services/locations.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityCategory } from '../../../core/enums/activity-category.enum';
import { TripLocation } from '../../../core/models/location.model';
import { MatDialog } from '@angular/material/dialog';
import { LocationDialogComponent } from '../location-dialog/location-dialog';
import { TripsService } from '../../../core/services/trips.service';
import { MapComponent } from '../../../shared/components/map/map';
import { GeocodingService } from '../../../core/services/geocoding.service';

@Component({
  selector: 'app-activity-form',
  imports: [ReactiveFormsModule, MapComponent],
  templateUrl: './activity-form.html',
  styleUrl: './activity-form.css',
})
export class ActivityFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private activitiesService = inject(ActivitiesService);
  private locationsService = inject(LocationsService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tripsService = inject(TripsService);
  private mapComponent = viewChild<MapComponent>('mapRef');
  private geocodingService = inject(GeocodingService);

  categories = Object.values(ActivityCategory);
  locations = signal<TripLocation[]>([]);
  locationSearch = signal<string>('');
  selectedLocation = signal<TripLocation | null>(null);
  isEditMode = signal<boolean>(false);
  activityId = signal<string | null>(null);
  tripId = signal<string>('');
  errorMessage = signal<string>('');
  tripDestinationCoords = signal<{ lat: number; lng: number} | undefined>(undefined);
  tripDateRange = signal<{ start: string; end: string | undefined } | null>(null);

  filteredLocations = computed(() => {
    const search = this.locationSearch().toLowerCase();
    if (!search) return this.locations();
    return this.locations().filter(loc => loc.name.toLowerCase().includes(search));
  })

  activityForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    category: [ActivityCategory.Transporte, Validators.required],
    start_time: ['', Validators.required],
    end_time: [''],
    cost: [0, [Validators.required, Validators.min(0)]],
    user_notes: [''],
    location_id: [''],
  });

  ngOnInit(): void {
    const tripId = this.route.snapshot.paramMap.get('tripId');
    const id = this.route.snapshot.paramMap.get('id');

    if (!tripId) {
      this.router.navigate(['/trips']);
      return;
    };

    this.tripId.set(tripId);
    this.loadLocations();
    this.loadTripDestination(tripId);

    if (id) {
      this.isEditMode.set(true);
      this.activityId.set(id);
      this.loadActivity(id);
      // this.loadTripDestination(tripId);
    };

    this.activityForm.get('start_time')?.valueChanges.subscribe(() => this.validateActivityDates());
    this.activityForm.get('end_time')?.valueChanges.subscribe(() => this.validateActivityDates());
  };

  private loadTripDestination(tripId: string): void {
    this.tripsService.getTripById(tripId).subscribe({
      next: trip => {
        this.tripDateRange.set({
          start: trip.start_date,
          end: trip.end_date ?? undefined,
        });
        if (trip.destination) {
          this.geocodingService.getCoordsByDestination(trip.destination).subscribe({
            next: coords => this.tripDestinationCoords.set(coords),
            error: async () => {
              const coords = await this.geocodingService.getUserLocationOrDefault();
              this.tripDestinationCoords.set(coords);
            },
          });
        } else {
          this.geocodingService.getUserLocationOrDefault().then(coords => {
            this.tripDestinationCoords.set(coords);
          });
        };
      },
    });
  };

  private loadLocations(): void {
    this.locationsService.getLocations().subscribe({
      next: locations => this.locations.set(locations),
      error: () => this.errorMessage.set('Error cargando ubicaciones'),
    });
  };

  private loadActivity(id: string): void {
    this.activitiesService.getActivityById(id).subscribe({
      next: activity => {
        this.activityForm.patchValue(activity);
        if (activity.location_id) {
          const location = this.locations().find(loc => loc.id === activity.location_id);
          if (location) this.selectedLocation.set(location);
        }
      },
      error: () => this.errorMessage.set('Error cargando la actividad'),
    });
  };

  onMarkerClicked(locationId: string): void {
    const location = this.locations().find(loc => loc.id === locationId);
    if (location) this.setLocation(location);
  };

  setLocation(location: TripLocation): void {
    this.selectedLocation.set(location);
    this.activityForm.patchValue({ location_id: location.id});
    this.locationSearch.set('');
    this.mapComponent()?.highlightLocationMarker(location.id);
};

  clearLocation(): void {
    this.selectedLocation.set(null);
    this.activityForm.patchValue({ location_id: ''});
  };

  openLocationDialog(): void {
    const dialogRef = this.dialog.open(LocationDialogComponent, {
      width: '90vw',
      maxWidth: '500px',
      data: {tripDestinationCoords: this.tripDestinationCoords()},
    });

    dialogRef.afterClosed().subscribe((location: TripLocation | null) => {
      if (location) {
        this.locations.update(locations => [...locations, location]);
        this.setLocation(location);
      };
    });
  };

  onSubmit(): void {
    if (this.activityForm.invalid) return;

    const formValue = this.activityForm.value;
    const tripId = this.tripId();

    const payload = {
      ...formValue,
      trip_id: tripId,
      end_time: formValue.end_time || undefined,
      user_notes: formValue.user_notes || undefined,
      location_id: formValue.location_id || undefined,
    };

    const id = this.activityId();

    if (this.isEditMode() && id) {
      this.activitiesService.updateActivity(id, payload).subscribe({
        next: () => this.router.navigate(['/trips', tripId, 'activities', id]),
        error: () => this.errorMessage.set('Error actualizando la actividad'),
      });
    } else {
      this.activitiesService.createActivity(payload).subscribe({
        next: activity => this.router.navigate(['/trips', tripId, 'activities', activity.id]),
        error: () => this.errorMessage.set('Error creando la actividad'),
      });
    };
  };

  private validateActivityDates(): void {
    const range = this.tripDateRange();
    if (!range) return;

    const startTime = this.activityForm.get('start_time')?.value;
    const endTime = this.activityForm.get('end_time')?.value;

    if (startTime) {
      const start = new Date(startTime);
      const tripStart = new Date(range.start);

      if (start < tripStart) {
        this.activityForm.get('start_time')?.setErrors({ beforeTripStart: true });
      };
      if (range.end) {
        const tripEnd = new Date(range.end);
        if (start > tripEnd) {
          this.activityForm.get('start_time')?.setErrors({ afterTripEnd: true });
        };
      };
    };

    if (endTime && startTime) {
      const end = new Date(endTime);
      const start = new Date(startTime);

      if (end < start) {
        this.activityForm.get('end_time')?.setErrors({ beforeStartTime: true });
      };
      if (range.end) {
        const tripEnd = new Date(range.end);
        if (end > tripEnd) {
          this.activityForm.get('end_time')?.setErrors({ endAfterTripEnd: true });
        };
      };
    };
  };

  goBack(): void {
    const id = this.activityId();
    const tripId = this.tripId();

    if (id) {
      this.router.navigate(['/trips', tripId, 'activities', id]);
    } else {
      this.router.navigate(['/trips', tripId]);
    };
  };
};
