import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { TripDetailFacade } from './trip-detail.facade';
import { TripsService } from '../../../../core/services/trips.service';
import { ActivitiesService } from '../../../../core/services/activities.service';
import { LocationsService } from '../../../../core/services/locations.service';
import { UsersService } from '../../../../core/services/user.service';
import { AiService } from '../../../../core/services/ai.service';
import { GeocodingService } from '../../../../core/services/geocoding.service';
import { AuthService } from '../../../../core/services/auth.service';

describe('TripDetailFacade', () => {
  let facade: TripDetailFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TripDetailFacade,
        { provide: TripsService, useValue: {
          getTripById: vi.fn().mockReturnValue(of(null)),
          getTravelRequirements: vi.fn().mockReturnValue(of(null)),
          deleteTrip: vi.fn().mockReturnValue(of(void 0)),
          createTravelRequirements: vi.fn().mockReturnValue(of(null)),
        }},
        { provide: ActivitiesService, useValue: {
          getActivitiesByTrip: vi.fn().mockReturnValue(of([])),
        }},
        { provide: LocationsService, useValue: {
          getLocations: vi.fn().mockReturnValue(of([])),
        }},
        { provide: UsersService, useValue: {
          getPublicProfile: vi.fn().mockReturnValue(of({ name: 'Test' })),
        }},
        { provide: AiService, useValue: {
          generateRequirements: vi.fn().mockReturnValue(of({})),
        }},
        { provide: GeocodingService, useValue: {
          getDestinationOrUserCoords: vi.fn().mockReturnValue(of({ lat: 0, lng: 0 })),
        }},
        { provide: AuthService, useValue: {
          getCurrentUserId: vi.fn().mockReturnValue('user1'),
        }},
      ],
    });
    facade = TestBed.inject(TripDetailFacade);
  });

  it('should create', () => {
    expect(facade).toBeTruthy();
  });
});
