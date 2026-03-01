import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then(m => m.RegisterComponent),
  },
  {
    path: 'trips',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/trips/trip-list/trip-list').then(m => m.TripListComponent),
  },
  {
    path: '',
    // redirectTo: 'trips',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'trips',
  },
];
