import { Component, inject } from '@angular/core';
import { TravelRequirement } from '../../../core/models/travel-requirement.model';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trip-requirements-dialog',
  imports: [CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './trip-requirements-dialog.html',
  styleUrl: './trip-requirements-dialog.css',
})
export class TravelRequirementsDialogComponent {
  readonly data = inject<TravelRequirement>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<TravelRequirementsDialogComponent>);

  close() { this.dialogRef.close(); }
};
