import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatIconModule],
})
export class ConfirmDialogComponent {
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  confirm(): void {
    this.dialogRef.close(true);
  };

  cancel(): void {
    this.dialogRef.close(false);
  };
};
