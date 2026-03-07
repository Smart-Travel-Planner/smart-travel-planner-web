import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivitiesService } from '../../../core/services/activities.service';
import { LocationsService } from '../../../core/services/locations.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityCategory } from '../../../core/enums/activity-category.enum';
import { TripLocation } from '../../../core/models/location.model';

@Component({
  selector: 'app-activity-form',
  imports: [ReactiveFormsModule],
  templateUrl: './activity-form.html',
  styleUrl: './activity-form.css',
})
export class ActivityFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private activitiesService = inject(ActivitiesService);
  private locationsService = inject(LocationsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  categories = Object.values(ActivityCategory);
  locations = signal<TripLocation[]>([]);
  isEditMode = signal<boolean>(false);
  activityId = signal<string | null>(null);
  tripId = signal<string>('');
  errorMessage = signal<string>('');

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

    if (id) {
      this.isEditMode.set(true);
      this.activityId.set(id);
      this.loadActivity(id);
    };
  };

  private loadLocations(): void {
    this.locationsService.getLocations().subscribe({
      next: locations => this.locations.set(locations),
      error: () => this.errorMessage.set('Error cargando ubicaciones'),
    });
  };

  private loadActivity(id: string): void {
    this.activitiesService.getActivityById(id).subscribe({
      next: activity => this.activityForm.patchValue(activity),
      error: () => this.errorMessage.set('Error cargando la actividad'),
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

  goBack(): void {
    const id = this.activityId();
    const tripId = this.tripId();

    if (id) {
      this.router.navigate(['/trips', tripId, 'activities', id]);
    } else {
      this.router.navigate(['/trips', tripId, 'activities']);
    };
  };
};
