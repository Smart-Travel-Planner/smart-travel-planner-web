import { ChangeDetectorRef, Component, computed, effect, input, signal, viewChild } from '@angular/core';
import { Trip } from '../../../core/models/trip.model';
import { Activity } from '../../../core/models/activity.model';
import { TripLocation } from '../../../core/models/location.model';
import { MapComponent } from '../../../shared/components/map/map';
import { MatIconModule } from '@angular/material/icon';
import { ACTIVITY_CATEGORY_COLORS } from '../../../core/enums/activity-category-colors.enum';
import { GeocodingService } from '../../../core/services/geocoding.service';
import { inject, OnInit } from '@angular/core';
import { FormatDatePipe } from '../../../shared/pipes/format-date-pipe';

@Component({
  selector: 'app-trip-explorer',
  imports: [MapComponent, MatIconModule, FormatDatePipe],
  templateUrl: './trip-explorer.html',
  styleUrl: './trip-explorer.css',
})
export class TripExplorerComponent {
  private geocodingService = inject(GeocodingService);
  private cdr = inject(ChangeDetectorRef);

  trip = input.required<Trip>();
  activities = input.required<Activity[]>();
  locations = input.required<TripLocation[]>();

  readonly categoryColors = ACTIVITY_CATEGORY_COLORS;

  tripDestinationCoords = signal<{ lat: number; lng: number } | undefined>(undefined);
  selectedActivity = signal<Activity | null>(null);
  highlightedActivityId = signal<string | null>(null);
  isDrawerOpen = computed(() => this.selectedActivity() !== null);

  private mapComponent = viewChild<MapComponent>('mapRef');

  locationMap = computed(() => {
    const map = new Map<string, string>();
    this.locations().forEach(loc => map.set(loc.id, loc.name));
    return map;
  });

  constructor() {
    effect(() => {
      const destination = this.trip().destination;
      if (destination) {
        this.geocodingService.getCoordsByDestination(destination).subscribe({
          next: coords => {
            this.tripDestinationCoords.set(coords);
            this.cdr.detectChanges();
          },
          error: async () => {
            const coords = await this.geocodingService.getUserLocationOrDefault();
            this.tripDestinationCoords.set(coords);
            this.cdr.detectChanges();
          },
        });
      } else {
        this.geocodingService.getUserLocationOrDefault().then(coords => {
          this.tripDestinationCoords.set(coords);
          this.cdr.detectChanges();
        });
      };
    });
  };

  getActivityLocation(locationId: string): TripLocation | undefined {
    return this.locations().find(l => l.id === locationId);
  };

  onActivityClicked(activity: Activity): void {
    this.selectedActivity.set(activity);
    this.highlightedActivityId.set(activity.id);
    this.mapComponent()?.highlightActivity(activity.id);
  };

  onMarkerClicked(activityId: string): void {
    const activity = this.activities().find(a => a.id === activityId);
    if (activity) {
      this.selectedActivity.set(activity);
      this.highlightedActivityId.set(activityId);
    }
    const element = document.getElementById(`activity-${activityId}`);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  closeDrawer(): void {
    this.selectedActivity.set(null);
    this.highlightedActivityId.set(null);
  };
};
