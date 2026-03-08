import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocationsService } from '../../../core/services/locations.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityCategory } from '../../../core/enums/activity-category.enum';

@Component({
  selector: 'app-location-form',
  imports: [ReactiveFormsModule],
  templateUrl: './location-form.html',
  styleUrl: './location-form.css',
})
export class LocationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private locationsService = inject(LocationsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  categories = Object.values(ActivityCategory);

  locationForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    category: [ActivityCategory.Transporte, Validators.required],
    lat: [0, [Validators.required, Validators.min(-90), Validators.max(90)]],
    lng: [0, [Validators.required, Validators.min(-180), Validators.max(180)]],
    address: [''],
    rating: [null, [Validators.min(0), Validators.max(5)]],
    place_id: [''],
  });

  isEditMode = signal<boolean>(false);
  locationId = signal<string | null>(null);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.locationId.set(id);
      this.loadLocation(id);
    };
  };

  private loadLocation(id: string): void {
    this.locationsService.getLocationById(id).subscribe({
      next: location => this.locationForm.patchValue(location),
      error: () => this.errorMessage.set('Error cargando la ubicación'),
    });
  };

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

    const id = this.locationId();

    if (this.isEditMode() && id) {
      this.locationsService.updateLocation(id, payload).subscribe({
        next: () => this.router.navigate(['/locations', id]),
        error: () => this.errorMessage.set('Error actualizando la ubicación'),
      });
    } else {
      this.locationsService.createLocation(payload).subscribe({
        next: location => this.router.navigate(['/locations', location.id]),
        error: () => this.errorMessage.set('Error creando la ubicación'),
      });
    };
  };

  goBack(): void {
    const id = this.locationId();
    if (id) {
      this.router.navigate(['/locations', id]);
    } else {
      this.router.navigate(['/locations']);
    };
  };
};
