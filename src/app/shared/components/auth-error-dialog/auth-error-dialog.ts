import { Component } from '@angular/core';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'app-auth-error-dialog',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
  templateUrl: './auth-error-dialog.html',
  styleUrl: './auth-error-dialog.css',
})
export class AuthErrorDialogComponent {

};
