import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { LocationsService } from '../../../core/services/locations.service';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TripLocation } from '../../../core/models/location.model';

@Component({
  selector: 'app-location-detail',
  imports: [],
  templateUrl: './location-detail.html',
  styleUrl: './location-detail.css',
})
export class LocationDetailComponent implements OnInit {
  private locationsService = inject(LocationsService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  location = signal<TripLocation | null>(null);
  errorMessage = signal<string>('');

  isOwner = computed(() => {
    const location = this.location();
    if (!location) return false;
    return location.created_by === this.authService.getCurrentUserId();
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/locations']);
      return;
    };
    this.loadLocation(id);
  };

  loadLocation(id: string): void {
    this.locationsService.getLocationById(id).subscribe({
      next: location => this.location.set(location),
      error: () => this.errorMessage.set('Error cargando la ubicación'),
    });
  };

  goToEdit(): void {
    this.router.navigate(['/locations', this.location()?.id, 'edit']);
  }

  goBack(): void {
    this.router.navigate(['/locations']);
  };

  deleteLocation(): void {
    const id = this.location()?.id;
    if (!id) return;

    this.locationsService.deleteLocation(id).subscribe({
      next: () => this.router.navigate(['/locations']),
      error: () => this.errorMessage.set('Error borrando la ubicacón'),
    });
  };
};
