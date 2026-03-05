import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivitiesService } from '../../../core/services/activities.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Activity } from '../../../core/models/activity.model';
import { ActivityCategory } from '../../../core/enums/activity-category.enum';

@Component({
  selector: 'app-activity-list',
  imports: [],
  templateUrl: './activity-list.html',
  styleUrl: './activity-list.css',
})
export class ActivityListComponent implements OnInit {
  activitiesService = inject(ActivitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private activities = signal<Activity[]>([]);
  activeCategory = signal<ActivityCategory | 'all'>('all');
  tripId = signal<string>('');
  errorMessage = signal<string>('');

  categories = Object.values(ActivityCategory);

  filteredActivities = computed(() => {
    let activities = this.activities();

    if (this.activeCategory() !== 'all') {
      activities = activities.filter(a => a.category === this.activeCategory());
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
  }

  private loadActivities(tripId: string): void {
    this.activitiesService.getActivitiesByTrip(tripId).subscribe({
      next: activities => this.activities.set(activities),
      error: () => this.errorMessage.set('Error cargando las actividades'),
    });
  };

  setCategory(category: ActivityCategory | 'all'): void {
    this.activeCategory.set(category);
  };

  goToCreate(): void {
    this.router.navigate(['/trips', this.tripId(), 'activities', 'new']);
  };

  goToDetail(id: string): void {
    this.router.navigate(['/trips', this.tripId(), 'activities', id]);
  };

}
