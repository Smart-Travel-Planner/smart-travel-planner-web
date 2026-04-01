import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TripsService } from '../../../core/services/trips.service';
import { Router } from '@angular/router';
import { Trip } from '../../../core/models/trip.model';
import { AuthService } from '../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { FormatDatePipe } from '../../../shared/pipes/format-date-pipe';
import { NavigationService } from '../../../core/services/navigation.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';

type TripFilter = 'all' | 'mine' | 'public';

@Component({
  selector: 'app-trip-list',
  imports: [MatIconModule, FormatDatePipe],
  templateUrl: './trip-list.html',
  styleUrl: './trip-list.css',
})
export class TripListComponent implements OnInit {
  tripsService = inject(TripsService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private navigationService = inject(NavigationService);
  private dialog = inject(MatDialog);

  private myTrips = signal<Trip[]>([]);
  private publicTrips = signal<Trip[]>([]);

  activeFilter = signal<TripFilter>('all');
  dateFrom = signal<string>('');
  dateTo = signal<string>('');
  errorMessage = signal<string>('');
  dateFromValue = signal<string>('');
  dateToValue = signal<string>('');

  readonly defaultImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';

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

  hasDateFilter = computed(() => !!this.dateFrom() || !!this.dateTo());
  hasTrips = computed(() => this.filteredTrips().length > 0);

  ngOnInit(): void {
    this.loadTrips();
    this.navigationService.setPreviousUrl(`/trips`);
  };

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

  isOwner(trip: Trip): boolean {
    return trip.user_id === this.authService.getCurrentUserId();
  };

  setFilter(filter: TripFilter): void {
    this.activeFilter.set(filter);
  };

  setDateFrom(value: string): void {
    this.dateFrom.set(value);
    this.dateFromValue.set(value);
  };

  setDateTo(value: string): void {
    this.dateTo.set(value);
    this.dateToValue.set(value);
  };

  goToDetail(id: string): void {
    this.router.navigate(['/trips', id]);
  };

  goToCreate(): void {
    this.navigationService.setPreviousUrl(`/trips`);
    this.router.navigate(['/trips/new']);
  };

  goToEdit(id: string): void {
    this.navigationService.setPreviousUrl(`/trips`);
    this.router.navigate(['/trips', id, 'edit']);
  };

  deleteTrip(id: string, title: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '90vw',
      maxWidth: '400px',
      data: {
        title: 'Eliminar viaje',
        message: `¿Estás seguro de que quieres eliminar "${title}"? Esta acción no se puede deshacer.`,
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.tripsService.deleteTrip(id).subscribe({
        next: () => this.loadTrips(),
        error: () => this.errorMessage.set('Error eliminando el viaje'),
      });
    });
  };

  resetDateFilters(): void {
    this.dateFrom.set('');
    this.dateTo.set('');
    this.dateFromValue.set('');
    this.dateToValue.set('');
  };
};
