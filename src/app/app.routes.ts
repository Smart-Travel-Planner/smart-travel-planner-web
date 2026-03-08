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
  path: 'locations',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/locations/location-list/location-list').then(m => m.LocationListComponent),
},
{
  path: 'locations/new',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/locations/location-form/location-form').then(m => m.LocationFormComponent),
},
{
  path: 'locations/:id/edit',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/locations/location-form/location-form').then(m => m.LocationFormComponent),
},
{
  path: 'locations/:id',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/locations/location-detail/location-detail').then(m => m.LocationDetailComponent),
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
  path: 'trips/:tripId/activities/:id',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/activities/activity-detail/activity-detail').then(m => m.ActivityDetailComponent),
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
