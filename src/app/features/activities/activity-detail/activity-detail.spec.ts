import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Component, Input } from '@angular/core';
import { ActivityDetailComponent } from './activity-detail';
import { ActivitiesService } from '../../../core/services/activities.service';
import { LocationsService } from '../../../core/services/locations.service';
import { MapComponent } from '../../../shared/components/map/map';
import { Activity } from '../../../core/models/activity.model';
import { TripLocation } from '../../../core/models/location.model';
import { ActivityCategory } from '../../../core/enums/activity-category.enum';

@Component({ selector: 'app-map', template: '' })
class MapStubComponent {
  @Input() centerLocation: any;
  @Input() centerCoords: any;
  @Input() mode: string = 'view';
  @Input() containerId: string = '';
  @Input() zoom: number = 13;
  @Input() locations: any[] = [];
  @Input() activities: any[] = [];
}

describe('ActivityDetailComponent', () => {
  let component: ActivityDetailComponent;
  let fixture: ComponentFixture<ActivityDetailComponent>;
  let activitiesServiceMock: Partial<ActivitiesService>;
  let locationsServiceMock: Partial<LocationsService>;

  const mockActivity: Activity = {
    id: '1',
    trip_id: 'trip1',
    title: 'Visita al museo',
    start_time: '2025-06-10T10:00:00',
    cost: 15,
    category: ActivityCategory.Cultura,
    location_id: 'loc1',
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
      deleteActivity: vi.fn().mockReturnValue(of(void 0)),
    };

    locationsServiceMock = {
      getLocationById: vi.fn().mockReturnValue(of(mockLocation)),
    };

    await TestBed.configureTestingModule({
      imports: [ActivityDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ActivitiesService, useValue: activitiesServiceMock },
        { provide: LocationsService, useValue: locationsServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'tripId' ? 'trip1' : '1',
              },
            },
          },
        },
      ],
    })
    .overrideComponent(ActivityDetailComponent, {
      remove: { imports: [MapComponent] },
      add: { imports: [MapStubComponent] },
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load activity on init', () => {
    expect(activitiesServiceMock.getActivityById).toHaveBeenCalledWith('1');
    expect(component.activity()?.title).toBe('Visita al museo');
  });

  it('should load location when activity has location_id', () => {
    expect(locationsServiceMock.getLocationById).toHaveBeenCalledWith('loc1');
    expect(component.location()?.name).toBe('Museo del Prado');
  });

  it('should compute locationCoords from location', () => {
    expect(component.locationCoords()).toEqual({ lat: 40.4138, lng: -3.6921 });
  });

  it('should show error message when loading activity fails', () => {
    (activitiesServiceMock.getActivityById as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => new Error('error'))
    );
    component.ngOnInit();
    expect(component.errorMessage()).toBe('Error cargando la actividad');
  });

  it('should call deleteActivity on delete', () => {
    component.deleteActivity();
    expect(activitiesServiceMock.deleteActivity).toHaveBeenCalledWith('1');
  });
});
