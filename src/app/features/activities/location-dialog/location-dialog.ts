import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { LocationsService } from '../../../core/services/locations.service';
import { ActivityCategory } from '../../../core/enums/activity-category.enum';
import { TripLocation } from '../../../core/models/location.model';

@Component({
  selector: 'app-location-dialog',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogContent, MatDialogActions],
  templateUrl: './location-dialog.html',
  styleUrl: './location-dialog.css',
})
export class LocationDialogComponent {
  private fb = inject(FormBuilder);
  private locationsService = inject(LocationsService);
  private dialogRef = inject(MatDialogRef<LocationDialogComponent>);

  categories = Object.values(ActivityCategory);
  errorMessage = signal<string>('');

  locationForm = this.fb.group({
    name: ['', Validators.required],
    category: [ActivityCategory.Transporte, Validators.required],
    lat: [0, [Validators.required, Validators.min(-90), Validators.max(90)]],
    lng: [0, [Validators.required, Validators.min(-180), Validators.max(180)]],
    address: [''],
    rating: [null, [Validators.min(0), Validators.max(5)]],
    place_id: [''],
  });

  onSubmit(): void {
    if (this.locationForm.invalid) return;

    const formValue = this.locationForm.value;

    const payload = {
      name: formValue.name as string,
      category: formValue.category as ActivityCategory,
      lat: formValue.lat as number,
      lng: formValue.lng as number,
      address: formValue.address || undefined,
      rating: formValue.rating ?? undefined,
      place_id: formValue.place_id || undefined,
    };

    this.locationsService.createLocation(payload).subscribe({
      next: (location: TripLocation) => this.dialogRef.close(location),
      error: () => this.errorMessage.set('Error creando la ubicación'),
    });
  };

  onCancel(): void {
    this.dialogRef.close(null);
  };
};
