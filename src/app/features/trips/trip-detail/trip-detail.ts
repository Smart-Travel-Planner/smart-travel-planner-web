
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TripsService } from '../../../core/services/trips.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Trip } from '../../../core/models/trip.model';
import { AuthService } from '../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { ActivitiesService } from '../../../core/services/activities.service';
import { UsersService } from '../../../core/services/user.service';
import { Activity } from '../../../core/models/activity.model';
import { LocationsService } from '../../../core/services/locations.service';
import { TripLocation } from '../../../core/models/location.model';
import { FormatDatePipe } from '../../../shared/pipes/format-date-pipe';
import { NavigationService } from '../../../core/services/navigation.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button';
import { TripPlannerComponent } from '../trip-planner/trip-planner';
import { TripExplorerComponent } from '../trip-explorer/trip-explorer';
import { TravelRequirement } from '../../../core/models/travel-requirement.model';
import { TravelRequirementsDialogComponent } from '../trip-requirements-dialog/trip-requirements-dialog';
import { AiService } from '../../../core/services/ai.service';

@Component({
  selector: 'app-trip-detail',
  imports: [MatIconModule, FormatDatePipe, BackButtonComponent, TripPlannerComponent, TripExplorerComponent],
  templateUrl: './trip-detail.html',
  styleUrl: './trip-detail.css',
})
export class TripDetailComponent implements OnInit {
  private tripsService = inject(TripsService);
  private activitiesService = inject(ActivitiesService);
  private usersService = inject(UsersService);
  private locationsService = inject(LocationsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private navigationService = inject(NavigationService);
  private dialog = inject(MatDialog);
  private aiService = inject(AiService);

  trip = signal<Trip | null>(null);
  activities = signal<Activity[]>([]);
  locations = signal<TripLocation[]>([]);
  creatorName = signal<string | null>(null);
  errorMessage = signal<string>('');
  requirements = signal<TravelRequirement | null>(null);

  readonly defaultImage = 'https://res.cloudinary.com/dux4gqdow/image/upload/v1773662802/pietro-de-grandi-T7K4aEPoGGk-unsplash_nqzjxq.jpg';

  isOwner = computed(() => {
    const trip = this.trip();
    if (!trip) return false;
    return trip.user_id === this.authService.getCurrentUserId();
  });

  locationMap = computed(() => {
    const map = new Map<string, string>();
    this.locations().forEach(loc => map.set(loc.id, loc.name));
    return map;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/trips']);
      return;
    };
    this.loadTrip(id);
    this.loadActivities(id);
    this.loadLocations();
  };

  private loadTrip(id: string): void {
    this.tripsService.getTripById(id).subscribe({
      next: trip => {
        this.trip.set(trip);
        if (trip.is_public && trip.user_id !== this.authService.getCurrentUserId()) {
          this.loadCreatorName(trip.user_id);
        };
        this.loadRequirements(id);
      },
      error: () => this.errorMessage.set('Error cargando el viaje'),
    });
  };

  private loadActivities(tripId: string): void {
    this.activitiesService.getActivitiesByTrip(tripId).subscribe({
      next: activities => this.activities.set(activities),
      error: () => this.errorMessage.set('Error cargando las actividades'),
    });
  };

  private loadCreatorName(userId: string): void {
    this.usersService.getPublicProfile(userId).subscribe({
      next: profile => this.creatorName.set(profile.name),
      error: () => this.creatorName.set(null),
    });
  };

  private loadLocations(): void {
    this.locationsService.getLocations().subscribe({
      next: locations => this.locations.set(locations),
      error: () => {},
    });
  };

  private loadRequirements(tripId: string): void {
    this.tripsService.getTravelRequirements(tripId).subscribe({
      next: reqs => this.requirements.set(reqs),
      error: () => {
        if (!this.isOwner()) return;

        const destination = this.trip()?.destination;
        if (!destination) return;

        this.aiService.generateRequirements(destination).subscribe({
          next: generated => {
            this.tripsService.createTravelRequirements({
              trip_id: tripId,
              ...generated,
            }).subscribe({
              next: saved => this.requirements.set(saved),
              error: () => console.warn('Error guardando los requisitos generados por la IA'),
            });
          },
          error: () => console.warn('Error generando requisitos con la IA'),
        });
      },
    });
  };

  goToEdit(): void {
    this.navigationService.setPreviousUrl(`/trips/${this.trip()?.id}`);
    this.router.navigate(['/trips', this.trip()?.id, 'edit']);
  };

  goBack(): void {
    this.router.navigate(['/trips']);
  }

  deleteTrip(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '90vw',
      maxWidth: '400px',
      data: {
        title: 'Eliminar viaje',
        message: `¿Estás seguro de que quieres eliminar "${this.trip()?.title}"? Esta acción no se puede deshacer.`,
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      const id = this.trip()?.id;
      if (!id) return;
      this.tripsService.deleteTrip(id).subscribe({
        next: () => this.router.navigate(['/trips']),
        error: () => this.errorMessage.set('Error eliminando el viaje'),
      });
    });
  };

  openAiInfo(): void {
    const data = this.requirements();
    if (!data) return;

    this.dialog.open(TravelRequirementsDialogComponent, {
      data: data,
      width: '95vw',
      maxWidth: '500px',
      panelClass: 'custom-ai-modal'
    });
  };
};
