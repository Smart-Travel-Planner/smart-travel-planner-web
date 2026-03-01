import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TripsService } from '../../../core/services/trips.service';
import { Router } from '@angular/router';
import { Trip } from '../../../core/models/trip.model';

type TripFilter = 'all' | 'mine' | 'public';

@Component({
  selector: 'app-trip-list',
  imports: [],
  templateUrl: './trip-list.html',
  styleUrl: './trip-list.css',
})
export class TripListComponent implements OnInit {
  tripsService = inject(TripsService);
  private router = inject(Router);

  private myTrips = signal<Trip[]>([]);
  private publicTrips = signal<Trip[]>([]);

  activeFilter = signal<TripFilter>('all');
  dateFrom = signal<string>('');
  dateTo = signal<string>('');
  errorMessage = signal<string>('');

  filteredTrips = computed(() => {
    let trips: Trip[] = [];

    if (this.activeFilter() === 'mine') {
      trips = this.myTrips();
    } else if (this.activeFilter() === 'public') {
      trips = this.publicTrips();
    } else {
      const myIds = new Set(this.myTrips().map(t => t.id));
      trips = [
        ...this.myTrips(),
        ...this.publicTrips().filter(t => !myIds.has(t.id)),
      ];
    }

    if (this.dateFrom()) {
      trips = trips.filter(t => t.start_date >= this.dateFrom());
    }

    if (this.dateTo()) {
      trips = trips.filter(t => t.start_date <= this.dateTo());
    }

    return trips;
  });

  ngOnInit(): void {
    this.loadTrips();
  }

  private loadTrips(): void {
    this.tripsService.getMyTrips().subscribe({
      next: trips => this.myTrips.set(trips),
      error: () => this.errorMessage.set('Error cargando tus viajes'),
    });

    this.tripsService.getPublicTrips().subscribe({
      next: trips => this.publicTrips.set(trips),
      error: () => this.errorMessage.set('Error cargando viajes públicos'),
    });
  };

  setFilter(filter: TripFilter): void {
    this.activeFilter.set(filter);
  };

  setDateFrom(value: string): void {
    this.dateFrom.set(value);
  };

  setDateTo(value: string): void {
    this.dateTo.set(value);
  };

  goToDetail(id: string): void {
    this.router.navigate(['/trips', id]);
  }

  goToCreate(): void {
    this.router.navigate(['/trips/new']);
  }
}
