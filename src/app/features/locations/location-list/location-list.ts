import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { LocationsService } from '../../../core/services/locations.service';
import { Router } from '@angular/router';
import { TripLocation } from '../../../core/models/location.model';
import { ActivityCategory } from '../../../core/enums/activity-category.enum';

@Component({
  selector: 'app-location-list',
  imports: [],
  templateUrl: './location-list.html',
  styleUrl: './location-list.css',
})
export class LocationListComponent implements OnInit {
  private locationsService = inject(LocationsService);
  private router = inject(Router);

  private locations = signal<TripLocation[]>([]);
  activeCategory = signal<ActivityCategory | 'all'>('all');
  errorMessage = signal<string>('');

  categories = Object.values(ActivityCategory);

  filteredLocations = computed(() => {
    if (this.activeCategory() === 'all') {
      return this.locations();
    };
    return this.locations().filter(l => l.category === this.activeCategory());
  });

  ngOnInit(): void {
    this.loadLocations();
  };

  private loadLocations(): void {
    this.locationsService.getLocations().subscribe({
      next: locations => this.locations.set(locations),
      error: () => this.errorMessage.set('Error cargando las ubicaciones'),
    });
  };

  setCategory(category: ActivityCategory | 'all'): void {
    this.activeCategory.set(category);
  };

  goToCreate(): void {
    this.router.navigate(['/locations/new']);
  };

  goToDetail(id: string): void {
    this.router.navigate(['/locations', id]);
  };
};
