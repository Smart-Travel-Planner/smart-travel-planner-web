import { MatIconModule } from '@angular/material/icon';
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
import { Trip } from '../../../core/models/trip.model';
import { ACTIVITY_CATEGORY_COLORS } from '../../../core/enums/activity-category-colors.enum';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button';
import { FormatDatePipe } from '../../../shared/pipes/format-date-pipe';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { NavigationService } from '../../../core/services/navigation.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-activity-list',
  imports: [MapComponent, MatIconModule, BackButtonComponent, FormatDatePipe, FormsModule],
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
  private dialog = inject(MatDialog);
  private navigationService = inject(NavigationService);
  private mapComponent = viewChild<MapComponent>('mapRef');

  private activities = signal<Activity[]>([]);
  locations = signal<TripLocation[]>([]);
  activeCategory = signal<ActivityCategory | 'all'>('all');
  tripId = signal<string>('');
  errorMessage = signal<string>('');
  highlightedActivityId = signal<string | null>(null);
  tripDestinationCoords = signal<{ lat: number; lng: number} | undefined>(undefined);
  trip = signal<Trip | null>(null);
  readonly defaultImage = 'https://res.cloudinary.com/dux4gqdow/image/upload/v1773662802/pietro-de-grandi-T7K4aEPoGGk-unsplash_nqzjxq.jpg';
  readonly categoryColors = ACTIVITY_CATEGORY_COLORS;
  locationMap = computed(() => {
    const map = new Map<string, string>();
    this.locations().forEach(loc => map.set(loc.id, loc.name));
    return map;
  });
  categories = Object.values(ActivityCategory);
  selectedActivity = signal<Activity | null>(null);
  isDrawerOpen = computed(() => this.selectedActivity() !== null);

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
    window.scrollTo(0, 0);
  };

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
          this.trip.set(trip);
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
    const activity = this.filteredActivities().find(a => a.id === activityId);
    if (activity) {
      this.selectedActivity.set(activity);
      this.highlightedActivityId.set(activityId);
    }
    const element = document.getElementById(`activity-${activityId}`);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  onActivityClicked(activity: Activity): void {
    this.selectedActivity.set(activity);
    this.highlightedActivityId.set(activity.id);
    this.mapComponent()?.highlightActivity(activity.id);
  };

  closeDrawer(): void {
    this.selectedActivity.set(null);
    this.highlightedActivityId.set(null);
  };

  getActivityLocation(locationId: string): TripLocation | undefined {
    return this.locations().find(l => l.id === locationId);
  };

  goToEditActivity(id: string): void {
    this.navigationService.setPreviousUrl(`/trips/${this.tripId()}/activities`);
    this.router.navigate(['/trips', this.tripId(), 'activities', id, 'edit']);
  };

  deleteActivity(activity: Activity): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '90vw',
      maxWidth: '400px',
      data: {
        title: 'Eliminar actividad',
        message: `¿Estás seguro de que quieres eliminar "${activity.title}"? Esta acción no se puede deshacer.`,
      },
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.activitiesService.deleteActivity(activity.id).subscribe({
        next: () => {
          this.closeDrawer();
          this.loadActivities(this.tripId());
        },
        error: () => this.errorMessage.set('Error eliminando la actividad'),
      });
    });
  };

  goToCreate(): void {
    this.navigationService.setPreviousUrl(`/trips/${this.tripId()}/activities`);
    this.router.navigate(['/trips', this.tripId(), 'activities', 'new']);
  };

  goBack(): void {
    this.router.navigate([this.navigationService.getPreviousUrl()]);
  };
};
