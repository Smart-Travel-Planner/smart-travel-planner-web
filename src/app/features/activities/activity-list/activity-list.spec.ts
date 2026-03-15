import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Component, Input } from '@angular/core';
import { ActivityListComponent } from './activity-list';
import { ActivitiesService } from '../../../core/services/activities.service';
import { LocationsService } from '../../../core/services/locations.service';
import { TripsService } from '../../../core/services/trips.service';
import { GeocodingService } from '../../../core/services/geocoding.service';
import { MapComponent } from '../../../shared/components/map/map';
import { Activity } from '../../../core/models/activity.model';
import { ActivityCategory } from '../../../core/enums/activity-category.enum';
import { Trip } from '../../../core/models/trip.model';

@Component({ selector: 'app-map', template: '' })
class MapStubComponent {
  @Input() activities: any[] = [];
  @Input() locations: any[] = [];
  @Input() centerCoords: any;
  @Input() mode: string = 'view';
  @Input() containerId: string = '';
  highlightActivity = vi.fn();

}

describe('ActivityListComponent', () => {
  let component: ActivityListComponent;
  let fixture: ComponentFixture<ActivityListComponent>;
  let activitiesServiceMock: Partial<ActivitiesService>;
  let locationsServiceMock: Partial<LocationsService>;
  let tripsServiceMock: Partial<TripsService>;
  let geocodingServiceMock: Partial<GeocodingService>;

  const mockActivity: Activity = {
    id: '1',
    trip_id: 'trip1',
    title: 'Visita al museo',
    start_time: '2025-06-01T10:00:00',
    cost: 15,
    category: ActivityCategory.Cultura,
  };

  const mockTrip: Trip = {
    id: 'trip1',
    user_id: 'user1',
    title: 'Viaje a París',
    destination: 'París',
    start_date: '2025-06-01',
    is_public: false,
    total_budget: 1000,
    created_at: '2025-01-01',
  };

  beforeEach(async () => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    activitiesServiceMock = {
      getActivitiesByTrip: vi.fn().mockReturnValue(of([mockActivity])),
    };

    locationsServiceMock = {
      getLocations: vi.fn().mockReturnValue(of([])),
    };

    tripsServiceMock = {
      getTripById: vi.fn().mockReturnValue(of(mockTrip)),
    };

    geocodingServiceMock = {
      getCoordsByDestination: vi.fn().mockReturnValue(of({ lat: 48.8566, lng: 2.3522 })),
      getUserLocationOrDefault: vi.fn().mockResolvedValue({ lat: 40.4168, lng: -3.7038 }),
    };

    await TestBed.configureTestingModule({
      imports: [ActivityListComponent],
      providers: [
        provideRouter([]),
        { provide: ActivitiesService, useValue: activitiesServiceMock },
        { provide: LocationsService, useValue: locationsServiceMock },
        { provide: TripsService, useValue: tripsServiceMock },
        { provide: GeocodingService, useValue: geocodingServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'trip1' } } },
        },
      ],
    })
    .overrideComponent(ActivityListComponent, {
      remove: { imports: [MapComponent] },
      add: { imports: [MapStubComponent] },
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load activities on init', () => {
    expect(activitiesServiceMock.getActivitiesByTrip).toHaveBeenCalledWith('trip1');
  });

  it('should show all activities by default', () => {
    expect(component.filteredActivities().length).toBe(1);
  });

  it('should filter activities by category', () => {
    component.setCategory(ActivityCategory.Cultura);
    expect(component.filteredActivities().length).toBe(1);

    component.setCategory(ActivityCategory.Transporte);
    expect(component.filteredActivities().length).toBe(0);
  });

  it('should highlight activity on marker click', () => {
    component.onMarkerClicked('1');
    expect(component.highlightedActivityId()).toBe('1');
  });

  it('should highlight activity on activity click', () => {
    component.onActivityClicked(mockActivity);
    expect(component.highlightedActivityId()).toBe('1');
  });

  it('should set trip destination coords from geocoding', () => {
    expect(geocodingServiceMock.getCoordsByDestination).toHaveBeenCalledWith('París');
    expect(component.tripDestinationCoords()).toEqual({ lat: 48.8566, lng: 2.3522 });
  });
});
