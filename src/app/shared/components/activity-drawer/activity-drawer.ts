import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Activity } from '../../../core/models/activity.model';
import { TripLocation } from '../../../core/models/location.model';
import { ACTIVITY_CATEGORY_COLORS } from '../../../core/enums/activity-category-colors.enum';
import { FormatDatePipe } from '../../pipes/format-date-pipe';

@Component({
  selector: 'app-activity-drawer',
  imports: [MatIconModule, FormatDatePipe],
  templateUrl: './activity-drawer.html',
  styleUrl: './activity-drawer.css',
})
export class ActivityDrawerComponent {
  activity = input.required<Activity | null>();
  locations = input.required<TripLocation[]>();
  isOpen = input.required<boolean>();
  readonly = input<boolean>(false);
  darkMode = input<boolean>(false);

  close = output<void>();
  edit = output<string>();
  delete = output<Activity>();

  readonly categoryColors = ACTIVITY_CATEGORY_COLORS;

  getActivityLocation(locationId: string): TripLocation | undefined {
    return this.locations().find(l => l.id === locationId);
  }
}
