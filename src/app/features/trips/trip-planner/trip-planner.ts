import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { Trip } from '../../../core/models/trip.model';
import { Activity } from '../../../core/models/activity.model';
import { CalendarComponent } from '../../calendar/calendar';
import { MatIconModule } from '@angular/material/icon';
import { ACTIVITY_CATEGORY_COLORS } from '../../../core/enums/activity-category-colors.enum';

@Component({
  selector: 'app-trip-planner',
  imports: [CalendarComponent, MatIconModule],
  templateUrl: './trip-planner.html',
})
export class TripPlannerComponent {
  private router = inject(Router);

  trip = input.required<Trip>();
  activities = input.required<Activity[]>();
  locationMap = input.required<Map<string, string>>();

  readonly categoryColors = ACTIVITY_CATEGORY_COLORS;

  getLocationName(locationId: string): string {
    return this.locationMap().get(locationId) ?? locationId;
  }

  goToActivities(): void {
    this.router.navigate(['/trips', this.trip().id, 'activities']);
  }

  goToNewActivity(): void {
    this.router.navigate(['/trips', this.trip().id, 'activities', 'new']);
  }
}
