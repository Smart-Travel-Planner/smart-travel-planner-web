import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivitiesService } from '../../../core/services/activities.service';
// import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Activity } from '../../../core/models/activity.model';
import { MapComponent } from '../../../shared/components/map/map';
import { LocationsService } from '../../../core/services/locations.service';
import { TripLocation } from '../../../core/models/location.model';

@Component({
  selector: 'app-activity-detail',
  imports: [MapComponent],
  templateUrl: './activity-detail.html',
  styleUrl: './activity-detail.css',
})
export class ActivityDetailComponent implements OnInit {
  private activitiesService = inject(ActivitiesService);
  private locationService = inject(LocationsService);
  // private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activity = signal<Activity | null>(null);
  location = signal<TripLocation | null>(null);
  errorMessage = signal<string>('');
  tripId = signal<string>('');

  locationCoords = computed(() => {
    const loc = this.location();
    if (!loc) return undefined;
    return { lat: loc.lat, lng: loc.lng };
  });

  isOwner = computed(() => {
    return !!this.activity();
  });

  ngOnInit(): void {
    const tripId = this.route.snapshot.paramMap.get('tripId');
    const id = this.route.snapshot.paramMap.get('id');

    if (!tripId || !id) {
      this.router.navigate(['/trips']);
      return;
    };

    this.tripId.set(tripId);
    this.loadActivity(id);
  };

  private loadActivity(id: string): void {
    this.activitiesService.getActivityById(id).subscribe({
      next: activity => {
        this.activity.set(activity)
        if (activity.location_id) {
          this.loadLocation(activity.location_id);
        };
      },
      error: () => this.errorMessage.set('Error cargando la actividad'),
    });
  };

  private loadLocation(locatonId: string): void {
    this.locationService.getLocationById(locatonId).subscribe({
      next: location => this.location.set(location),
      error: () => this.errorMessage.set('Error cargando la ubicación'),
    });
  };

  goToEdit(): void {
    this.router.navigate(['/trips', this.tripId(), 'activities', this.activity()?.id, 'edit']);
  };

  goBack(): void {
    this.router.navigate(['/trips', this.tripId(), 'activities']);
  };

  deleteActivity(): void {
    const id = this.activity()?.id;
    if (!id) return;

    this.activitiesService.deleteActivity(id).subscribe({
      next: () => this.router.navigate(['/trips', this.tripId(), 'activities']),
      error: () => this.errorMessage.set('Error borrando la actividad'),
    });
  };
};
