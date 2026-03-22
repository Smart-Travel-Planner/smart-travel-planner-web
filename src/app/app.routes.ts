import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { HomeComponent } from './shared/home/home';
import { LoginComponent } from './features/auth/login/login';

export const routes: Routes = [

  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },

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
    path: 'trips/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/trips/trip-form/trip-form').then(m => m.TripFormComponent),
  },
  {
    path: 'trips/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/trips/trip-detail/trip-detail').then(m => m.TripDetailComponent),
  },
  {
    path: 'trips/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/trips/trip-form/trip-form').then(m => m.TripFormComponent),
  },
  {
    path: 'trips/:tripId/activities',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/activities/activity-list/activity-list').then(m => m.ActivityListComponent),
  },
  {
    path: 'trips/:tripId/activities/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/activities/activity-form/activity-form').then(m => m.ActivityFormComponent),
  },
  {
    path: 'trips/:tripId/activities/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/activities/activity-form/activity-form').then(m => m.ActivityFormComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
