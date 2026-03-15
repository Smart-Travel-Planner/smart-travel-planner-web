import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthErrorDialogComponent } from '../../shared/components/auth-error-dialog/auth-error-dialog';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private authService = inject(AuthService);

  private authDialogOpen = false;

  showError(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['snackbar-error'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  };

  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['snackbar-success'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  };

  showAuthError(): void {
    if (this.authDialogOpen) return;

    this.authDialogOpen = true;
    this.authService.logout();

    const dialogRef = this.dialog.open(AuthErrorDialogComponent, {
      width: '90vw',
      maxWidth: '400px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.authDialogOpen = false;
      this.router.navigate(['']);
    });
  };
};
