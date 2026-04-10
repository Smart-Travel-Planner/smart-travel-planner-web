import { Component, computed, inject, input, OnInit, output, signal, viewChild } from '@angular/core';
import { Activity } from '../../../core/models/activity.model';
import { TripLocation } from '../../../core/models/location.model';
import { ActivityCategory } from '../../../core/enums/activity-category.enum';
import { ACTIVITY_CATEGORY_COLORS } from '../../../core/enums/activity-category-colors.enum';
import { MapComponent } from '../map/map';
import { MatIconModule } from '@angular/material/icon';
import { FormatDatePipe } from '../../pipes/format-date-pipe';
import { FormsModule } from '@angular/forms';
import { ActivityDrawerComponent } from '../activity-drawer/activity-drawer';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
import { ActivitiesService } from '../../../core/services/activities.service';

@Component({
  selector: 'app-activity-map-list',
  imports: [MapComponent, MatIconModule, FormatDatePipe, FormsModule, ActivityDrawerComponent],
  templateUrl: './activity-map-list.html',
  styleUrl: './activity-map-list.css',
})
export class ActivityMapListComponent implements OnInit {
  private dialog = inject(MatDialog);
  private activitiesService = inject(ActivitiesService);

  tripId = input.required<string>();
  locations = input.required<TripLocation[]>();
  tripDestinationCoords = input.required<{ lat: number; lng: number } | undefined>();
  containerId = input.required<string>();
  darkMode = input<boolean>(false);
  readonly = input<boolean>(false);

  editActivity = output<string>();

  private mapComponent = viewChild<MapComponent>('mapRef');

  readonly categoryColors = ACTIVITY_CATEGORY_COLORS;
  readonly categories = Object.values(ActivityCategory);

  activities = signal<Activity[]>([]);
  errorMessage = signal<string>('');
  activeCategory = signal<ActivityCategory | 'all'>('all');
  selectedActivity = signal<Activity | null>(null);
  highlightedActivityId = signal<string | null>(null);
  isDrawerOpen = computed(() => this.selectedActivity() !== null);

  filteredActivities = computed(() => {
    const category = this.activeCategory();
    let activities = this.activities();
    if (category !== 'all') {
      activities = activities.filter(a => a.category === category);
    }
    return activities.sort((a, b) => a.start_time.localeCompare(b.start_time));
  });

  ngOnInit(): void {
    this.loadActivities();
  }

  private loadActivities(): void {
    this.activitiesService.getActivitiesByTrip(this.tripId()).subscribe({
      next: activities => this.activities.set(activities),
      error: () => this.errorMessage.set('Error cargando las actividades'),
    });
  }

  setCategory(category: ActivityCategory | 'all'): void {
    this.activeCategory.set(category);
  }

  onActivityClicked(activity: Activity): void {
    this.selectedActivity.set(activity);
    this.highlightedActivityId.set(activity.id);
    this.mapComponent()?.highlightActivity(activity.id);
  }

  onMarkerClicked(activityId: string): void {
    const activity = this.filteredActivities().find(a => a.id === activityId);
    if (activity) {
      this.selectedActivity.set(activity);
      this.highlightedActivityId.set(activityId);
    }
    this.mapComponent()?.highlightActivity(activityId);
    const element = document.getElementById(`activity-${activityId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
    }
  }

  closeDrawer(): void {
    this.selectedActivity.set(null);
    this.highlightedActivityId.set(null);
  }

  onEditActivity(id: string): void {
    this.editActivity.emit(id);
  }

  onDeleteActivity(activity: Activity): void {
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
          this.loadActivities();
        },
        error: () => this.errorMessage.set('Error eliminando la actividad'),
      });
    });
  }
}
