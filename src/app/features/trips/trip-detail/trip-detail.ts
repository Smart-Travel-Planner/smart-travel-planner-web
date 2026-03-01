import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TripsService } from '../../../core/services/trips.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Trip } from '../../../core/models/trip.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-trip-detail',
  imports: [],
  templateUrl: './trip-detail.html',
  styleUrl: './trip-detail.css',
})
export class TripDetailComponent implements OnInit {
  private tripsService = inject(TripsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  trip = signal<Trip | null>(null);
  errorMessage = signal<string>('');

  isOwner = computed(() => {
    const trip = this.trip();
    if (!trip) return false;
    return trip.user_id === this.authService.getCurrentUserId();
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/trips']);
      return;
    }
    this.loadTrip(id);
  }

  private loadTrip(id: string): void {
    this.tripsService.getTripById(id).subscribe({
      next: trip => this.trip.set(trip),
      error: () => this.errorMessage.set('Error cargando el viaje'),
    })
  }

  goToEdit(): void {
    this.router.navigate(['/trips', this.trip()?.id, 'edit']);
  }

  goBack(): void {
    this.router.navigate(['/trips']);
  }

  deleteTrip(): void {
    const id = this.trip()?.id;
    if (!id) return;

    this.tripsService.deleteTrip(id).subscribe({
      next: () => this.router.navigate(['/trips']),
      error: () => this.errorMessage.set('Error eliminando el viaje'),
    });
  };
};
