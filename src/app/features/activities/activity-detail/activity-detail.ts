import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivitiesService } from '../../../core/services/activities.service';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Activity } from '../../../core/models/activity.model';

@Component({
  selector: 'app-activity-detail',
  imports: [],
  templateUrl: './activity-detail.html',
  styleUrl: './activity-detail.css',
})
export class ActivityDetailComponent implements OnInit {
  private activitiesService = inject(ActivitiesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activity = signal<Activity | null>(null);
  errorMessage = signal<string>('');
  tripId = signal<string>('');

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
      next: activity => this.activity.set(activity),
      error: () => this.errorMessage.set('Error cargando la actividad'),
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
