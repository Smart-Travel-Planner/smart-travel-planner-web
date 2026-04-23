
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormatDatePipe } from '../../../shared/pipes/format-date-pipe';
import { NavigationService } from '../../../core/services/navigation.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button';
import { TripPlannerComponent } from '../trip-planner/trip-planner';
import { TravelRequirementsDialogComponent } from '../trip-requirements-dialog/trip-requirements-dialog';
import { ActivityMapListComponent } from '../../../shared/components/activity-map-list/activity-map-list';
import { TripDetailFacade } from './trip-detail.facade/trip-detail.facade';

@Component({
  selector: 'app-trip-detail',
  imports: [MatIconModule, FormatDatePipe, BackButtonComponent, TripPlannerComponent, ActivityMapListComponent],
  providers: [TripDetailFacade],
  templateUrl: './trip-detail.html',
  styleUrl: './trip-detail.css',
})
export class TripDetailComponent implements OnInit {
  facade = inject(TripDetailFacade);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private navigationService = inject(NavigationService);
  private dialog = inject(MatDialog);

  readonly defaultImage = 'https://res.cloudinary.com/dux4gqdow/image/upload/v1773662802/pietro-de-grandi-T7K4aEPoGGk-unsplash_nqzjxq.jpg';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/trips']);
      return;
    };
    this.facade.load(id);
  };

  goToEdit(): void {
    this.navigationService.setPreviousUrl(`/trips/${this.facade.trip()?.id}`);
    this.router.navigate(['/trips', this.facade.trip()?.id, 'edit']);
  };

  goBack(): void {
    this.router.navigate(['/trips']);
  };

  deleteTrip(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '90vw',
      maxWidth: '400px',
      data: {
        title: 'Eliminar viaje',
        message: `¿Estás seguro de que quieres eliminar "${this.facade.trip()?.title}"? Esta acción no se puede deshacer.`,
      },
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      const id = this.facade.trip()?.id;
      if (!id) return;
      this.facade.deleteTrip(id);
      this.router.navigate(['/trips']);
    });
  };

  openAiInfo(): void {
    const data = this.facade.requirements();
    if (!data) return;
    this.dialog.open(TravelRequirementsDialogComponent, {
      data,
      width: '95vw',
      maxWidth: '500px',
      panelClass: 'custom-ai-modal',
    });
  };
};
