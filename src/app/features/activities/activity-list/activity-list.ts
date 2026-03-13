import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivitiesService } from '../../../core/services/activities.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Activity } from '../../../core/models/activity.model';
import { ActivityCategory } from '../../../core/enums/activity-category.enum';
import { MapComponent } from '../../../shared/components/map/map';
import { LocationsService } from '../../../core/services/locations.service';
import { TripLocation } from '../../../core/models/location.model';
import { TripsService } from '../../../core/services/trips.service';
import { GeocodingService } from '../../../core/services/geocoding.service';

@Component({
  selector: 'app-activity-list',
  imports: [MapComponent],
  templateUrl: './activity-list.html',
  styleUrl: './activity-list.css',
})
export class ActivityListComponent implements OnInit {
  activitiesService = inject(ActivitiesService);
  locationsService = inject(LocationsService);
  private tripsService = inject(TripsService);
  private geocodingService = inject(GeocodingService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private mapComponent = viewChild<MapComponent>('mapRef');

  private activities = signal<Activity[]>([]);
  locations = signal<TripLocation[]>([]);
  activeCategory = signal<ActivityCategory | 'all'>('all');
  tripId = signal<string>('');
  errorMessage = signal<string>('');
  highlightedActivityId = signal<string | null>(null);
  tripDestinationCoords = signal<{ lat: number; lng: number} | undefined>(undefined);

  categories = Object.values(ActivityCategory);

  filteredActivities = computed(() => {
    const category = this.activeCategory();
    let activities = this.activities();

    if (this.activeCategory() !== 'all') {
      activities = activities.filter(a => a.category === category);
    };
    return activities.sort((a, b) => a.start_time.localeCompare(b.start_time));
  });

  ngOnInit(): void {
    const tripId = this.route.snapshot.paramMap.get('tripId');
    if (!tripId) {
      this.router.navigate(['/trips']);
      return;
    };
    this.tripId.set(tripId);
    this.loadActivities(tripId);
    this.loadLocations();
    this.loadTripDestination(tripId);
  }

  private loadActivities(tripId: string): void {
    this.activitiesService.getActivitiesByTrip(tripId).subscribe({
      next: activities => this.activities.set(activities),
      error: () => this.errorMessage.set('Error cargando las actividades'),
    });
  };

  private loadLocations(): void {
    this.locationsService.getLocations().subscribe({
      next: locations => this.locations.set(locations),
      error: () => this.errorMessage.set('Error cargando las ubicaciones'),
    });
  };

  private loadTripDestination(tripId: string): void {
    this.tripsService.getTripById(tripId).subscribe({
      next: trip => {
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

  setCategory(category: ActivityCategory | 'all'): void {
    this.activeCategory.set(category);
  };

  onMarkerClicked(activityId: string): void {
    this.highlightedActivityId.set(activityId);
    const element = document.getElementById(`activity-${activityId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center'});
    };
  };

  onActivityClicked(activity: Activity): void {
    this.highlightedActivityId.set(activity.id);
    this.mapComponent()?.highlightActivity(activity.id);
  }

  goToCreate(): void {
    this.router.navigate(['/trips', this.tripId(), 'activities', 'new']);
  };

  goToDetail(id: string): void {
    this.router.navigate(['/trips', this.tripId(), 'activities', id]);
  };

  goBack(): void {
    this.router.navigate(['/trips', this.tripId()]);
  }
};
