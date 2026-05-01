
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { TripDetailComponent } from './trip-detail';
import { TripDetailFacade } from './trip-detail.facade/trip-detail.facade';
import { TripsService } from '../../../core/services/trips.service';
import { AuthService } from '../../../core/services/auth.service';
import { ActivitiesService } from '../../../core/services/activities.service';
import { LocationsService } from '../../../core/services/locations.service';
import { UsersService } from '../../../core/services/user.service';
import { NavigationService } from '../../../core/services/navigation.service';
import { GeocodingService } from '../../../core/services/geocoding.service';
import { AiService } from '../../../core/services/ai.service';
import { MatDialog } from '@angular/material/dialog';
import { Trip } from '../../../core/models/trip.model';

describe('TripDetailComponent', () => {
  let component: TripDetailComponent;
  let fixture: ComponentFixture<TripDetailComponent>;
  let tripsServiceMock: Partial<TripsService>;
  let authServiceMock: Partial<AuthService>;

  const mockTrip: Trip = {
    id: '1',
    user_id: 'user1',
    title: 'Viaje a París',
    start_date: '2025-06-01',
    is_public: false,
    total_budget: 1000,
    created_at: '2025-01-01',
  };

  beforeEach(async () => {
    tripsServiceMock = {
      getTripById: vi.fn().mockReturnValue(of(mockTrip)),
      deleteTrip: vi.fn().mockReturnValue(of(void 0)),
      getTravelRequirements: vi.fn().mockReturnValue(throwError(() => new Error('no reqs'))),
      createTravelRequirements: vi.fn().mockReturnValue(of(null)),
    };

    authServiceMock = {
      getCurrentUserId: vi.fn().mockReturnValue('user1'),
    };

    await TestBed.configureTestingModule({
      imports: [TripDetailComponent],
      providers: [
        provideRouter([]),
        TripDetailFacade,
        { provide: TripsService, useValue: tripsServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: ActivitiesService,
          useValue: { getActivitiesByTrip: vi.fn().mockReturnValue(of([])) },
        },
        {
          provide: LocationsService,
          useValue: { getLocations: vi.fn().mockReturnValue(of([])) },
        },
        {
          provide: UsersService,
          useValue: { getPublicProfile: vi.fn().mockReturnValue(of({ name: 'Test User' })) },
        },
        {
          provide: NavigationService,
          useValue: { setPreviousUrl: vi.fn(), getPreviousUrl: vi.fn().mockReturnValue('/trips') },
        },
        {
          provide: GeocodingService,
          useValue: {
            getDestinationOrUserCoords: vi.fn().mockReturnValue(of({ lat: 41.4, lng: 2.1 })),
          },
        },
        {
          provide: AiService,
          useValue: { generateRequirements: vi.fn().mockReturnValue(of({})) },
        },
        {
          provide: MatDialog,
          useValue: {
            open: vi.fn().mockReturnValue({ afterClosed: () => of(true) }),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);

    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(TripDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load trip on init', () => {
    expect(tripsServiceMock.getTripById).toHaveBeenCalledWith('1');
    expect(component.facade.trip()?.title).toBe('Viaje a París');
  });

  it('should return true if current user is owner', () => {
    expect(component.facade.isOwner()).toBe(true);
  });

  it('should return false if trip is null', () => {
    component.facade['_trip'].set(null);
    (authServiceMock.getCurrentUserId as ReturnType<typeof vi.fn>).mockReturnValue('other-user');
    expect(component.facade.isOwner()).toBe(false);
  });

  it('should show error message when loading fails', () => {
    (tripsServiceMock.getTripById as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => new Error('error'))
    );
    component.ngOnInit();
    expect(component.facade.errorMessage()).toBe('Error cargando el viaje');
  });

  it('should call deleteTrip and navigate on delete', () => {
    component.deleteTrip();
    expect(tripsServiceMock.deleteTrip).toHaveBeenCalledWith('1');
  });
});
