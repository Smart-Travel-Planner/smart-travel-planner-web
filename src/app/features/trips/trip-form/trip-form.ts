import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TripsService } from '../../../core/services/trips.service';
import { ActivatedRoute, Router } from '@angular/router';
import { toDateInput, toDateTimeInput } from '../../../core/utils/date.utils';
import { NavigationService } from '../../../core/services/navigation.service';
import { MatIconModule } from '@angular/material/icon';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button';

@Component({
  selector: 'app-trip-form',
  imports: [ReactiveFormsModule, MatIconModule, BackButtonComponent],
  templateUrl: './trip-form.html',
  styleUrl: './trip-form.css',
})
export class TripFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tripsService = inject(TripsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private navigationService = inject(NavigationService);

  tripForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    destination: [''],
    start_date: ['', Validators.required],
    end_date: [''],
    total_budget: [0, [Validators.required, Validators.min(1)]],
    is_public: [false, Validators.required],
    image_url: [''],
  });

  isEditMode = signal<boolean>(false);
  tripId = signal<string | null>(null);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.tripId.set(id);
      this.loadTrip(id);
    };
  };

  private loadTrip(id: string): void  {
    this.tripsService.getTripById(id).subscribe({
      next: trip => {
        this.tripForm.patchValue({
        ...trip,
        start_date: toDateTimeInput(trip.start_date),
        end_date: toDateTimeInput(trip.end_date),
        });
      },
      error: () => this.errorMessage.set('Error cargando el viaje'),
    })
  };

  onSubmit(): void {
    if (this.tripForm.invalid) return;

    const formValue = this.tripForm.value;

    const payLoad = {
      ...formValue,
      end_date: formValue.end_date || undefined,
      image_url: formValue.image_url || undefined,
      destination: formValue.destination || undefined,
    }

    const id = this.tripId();

    if (this.isEditMode() && id) {
      this.tripsService.updateTrip(id, payLoad).subscribe({
        next: () => this.router.navigate(['/trips', id]),
        error: () => this.errorMessage.set('Error actualizando el viaje'),
      });
    } else {
      this.tripsService.createTrip(payLoad).subscribe({
        next: trip => this.router.navigate(['/trips', trip.id]),
        error: () => this.errorMessage.set('Error creando el viaje'),
      });
    }
  };

  isInvalid(controlName: string): boolean {
    const control = this.tripForm.get(controlName);
    return !!(control?.invalid && control?.touched);
  };

  goBack(): void {
    const id = this.tripId();
    this.router.navigate([this.navigationService.getPreviousUrl()]);
  };
};
