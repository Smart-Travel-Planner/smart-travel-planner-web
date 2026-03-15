import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Component, Input } from '@angular/core';
import { ActivityFormComponent } from './activity-form';
import { ActivitiesService } from '../../../core/services/activities.service';
import { LocationsService } from '../../../core/services/locations.service';
import { TripsService } from '../../../core/services/trips.service';
import { GeocodingService } from '../../../core/services/geocoding.service';
import { MatDialog } from '@angular/material/dialog';
import { MapComponent } from '../../../shared/components/map/map';
import { Activity } from '../../../core/models/activity.model';
import { TripLocation } from '../../../core/models/location.model';
import { ActivityCategory } from '../../../core/enums/activity-category.enum';
import { Trip } from '../../../core/models/trip.model';

@Component({ selector: 'app-map', template: '' })
class MapStubComponent {
  @Input() activities: any[] = [];
  @Input() locations: any[] = [];
  @Input() centerCoords: any;
  @Input() mode: string = 'view';
  @Input() containerId: string = '';
  highlightLocationMarker = vi.fn();
}

describe('ActivityFormComponent', () => {
  let component: ActivityFormComponent;
  let fixture: ComponentFixture<ActivityFormComponent>;
  let activitiesServiceMock: Partial<ActivitiesService>;
  let locationsServiceMock: Partial<LocationsService>;
  let tripsServiceMock: Partial<TripsService>;
  let geocodingServiceMock: Partial<GeocodingService>;
  let matDialogMock: Partial<MatDialog>;

  const mockTrip: Trip = {
    id: 'trip1',
    user_id: 'user1',
    title: 'Viaje a París',
    destination: 'París',
    start_date: '2025-06-01',
    end_date: '2025-06-30',
    is_public: false,
    total_budget: 1000,
    created_at: '2025-01-01',
  };

  const mockActivity: Activity = {
    id: '1',
    trip_id: 'trip1',
    title: 'Visita al museo',
    start_time: '2025-06-10T10:00:00',
    cost: 15,
    category: ActivityCategory.Cultura,
  };

  const mockLocation: TripLocation = {
    id: 'loc1',
    name: 'Museo del Prado',
    category: ActivityCategory.Cultura,
    lat: 40.4138,
    lng: -3.6921,
  };

  beforeEach(async () => {
    activitiesServiceMock = {
      getActivityById: vi.fn().mockReturnValue(of(mockActivity)),
      createActivity: vi.fn().mockReturnValue(of(mockActivity)),
      updateActivity: vi.fn().mockReturnValue(of(mockActivity)),
    };

    locationsServiceMock = {
      getLocations: vi.fn().mockReturnValue(of([mockLocation])),
    };

    tripsServiceMock = {
      getTripById: vi.fn().mockReturnValue(of(mockTrip)),
    };

    geocodingServiceMock = {
      getCoordsByDestination: vi.fn().mockReturnValue(of({ lat: 48.8566, lng: 2.3522 })),
      getUserLocationOrDefault: vi.fn().mockResolvedValue({ lat: 40.4168, lng: -3.7038 }),
    };

    matDialogMock = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ActivityFormComponent],
      providers: [
        provideRouter([]),
        { provide: ActivitiesService, useValue: activitiesServiceMock },
        { provide: LocationsService, useValue: locationsServiceMock },
        { provide: TripsService, useValue: tripsServiceMock },
        { provide: GeocodingService, useValue: geocodingServiceMock },
        { provide: MatDialog, useValue: matDialogMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (key: string) => key === 'tripId' ? 'trip1' : null } } },
        },
      ],
    })
    .overrideComponent(ActivityFormComponent, {
      remove: { imports: [MapComponent] },
      add: { imports: [MapStubComponent] },
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in create mode by default', () => {
    expect(component.isEditMode()).toBe(false);
  });

  it('should load locations on init', () => {
    expect(locationsServiceMock.getLocations).toHaveBeenCalled();
  });

  it('should not submit if form is invalid', () => {
    component.activityForm.get('title')?.setValue('');
    component.onSubmit();
    expect(activitiesServiceMock.createActivity).not.toHaveBeenCalled();
  });

  it('should call createActivity on submit in create mode', () => {
    component.activityForm.setValue({
      title: 'Visita al museo',
      category: ActivityCategory.Cultura,
      start_time: '2025-06-10T10:00:00',
      end_time: '',
      cost: 15,
      user_notes: '',
      location_id: '',
    });
    component.onSubmit();
    expect(activitiesServiceMock.createActivity).toHaveBeenCalled();
  });

  it('should show error message when create fails', () => {
    (activitiesServiceMock.createActivity as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => new Error('error'))
    );

    component.activityForm.setValue({
      title: 'Visita al museo',
      category: ActivityCategory.Cultura,
      start_time: '2025-06-10T10:00:00',
      end_time: '',
      cost: 15,
      user_notes: '',
      location_id: '',
    });
    component.onSubmit();
    expect(component.errorMessage()).toBe('Error creando la actividad');
  });

  it('should set selected location', () => {
    component.setLocation(mockLocation);
    expect(component.selectedLocation()).toEqual(mockLocation);
    expect(component.activityForm.get('location_id')?.value).toBe('loc1');
  });

  it('should clear selected location', () => {
    component.setLocation(mockLocation);
    component.clearLocation();
    expect(component.selectedLocation()).toBeNull();
    expect(component.activityForm.get('location_id')?.value).toBe('');
  });

  it('should validate start_time before trip start', () => {
    component.tripDateRange.set({ start: '2025-06-01', end: '2025-06-30' });
    component.activityForm.get('start_time')?.setValue('2025-05-01T10:00:00');
    expect(component.activityForm.get('start_time')?.errors?.['beforeTripStart']).toBeTruthy();
  });
});
