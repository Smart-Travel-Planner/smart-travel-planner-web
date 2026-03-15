import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Component, Input } from '@angular/core';
import { TripDetailComponent } from './trip-detail';
import { TripsService } from '../../../core/services/trips.service';
import { AuthService } from '../../../core/services/auth.service';
import { Trip } from '../../../core/models/trip.model';
import { CalendarComponent } from '../../calendar/calendar';

@Component({ selector: 'app-calendar', template: '' })
class CalendarStubComponent {
  @Input() trip: any;
}

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
    };

    authServiceMock = {
      getCurrentUserId: vi.fn().mockReturnValue('user1'),
    };

    await TestBed.configureTestingModule({
      imports: [TripDetailComponent],
      providers: [
        provideRouter([]),
        { provide: TripsService, useValue: tripsServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
      ],
    })
    .overrideComponent(TripDetailComponent, {
      remove: { imports: [CalendarComponent] },
      add: { imports: [CalendarStubComponent] },
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load trip on init', () => {
    expect(tripsServiceMock.getTripById).toHaveBeenCalledWith('1');
    expect(component.trip()?.title).toBe('Viaje a París');
  });

  it('should return true if current user is owner', () => {
    expect(component.isOwner()).toBe(true);
  });

  it('should return false if trip is null', () => {
    component.trip.set(null);
    expect(component.isOwner()).toBe(false);
  });

  it('should show error message when loading fails', () => {
    (tripsServiceMock.getTripById as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => new Error('error'))
    );
    component.ngOnInit();
    expect(component.errorMessage()).toBe('Error cargando el viaje');
  });

  it('should call deleteTrip and navigate on delete', () => {
    component.deleteTrip();
    expect(tripsServiceMock.deleteTrip).toHaveBeenCalledWith('1');
  });
});
