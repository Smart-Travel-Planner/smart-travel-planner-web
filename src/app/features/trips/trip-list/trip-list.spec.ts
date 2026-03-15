import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { TripListComponent } from './trip-list';
import { TripsService } from '../../../core/services/trips.service';
import { Trip } from '../../../core/models/trip.model';

describe('TripListComponent', () => {
  let component: TripListComponent;
  let fixture: ComponentFixture<TripListComponent>;
  let tripsServiceMock: Partial<TripsService>;

  const mockMyTrip: Trip = {
    id: '1',
    user_id: 'user1',
    title: 'Mi viaje a París',
    start_date: '2025-06-01',
    is_public: false,
    total_budget: 1000,
    created_at: '2025-01-01',
  };

  const mockPublicTrip: Trip = {
    id: '2',
    user_id: 'user2',
    title: 'Viaje público a Roma',
    start_date: '2025-07-01',
    is_public: true,
    total_budget: 800,
    created_at: '2025-01-01',
  };

  beforeEach(async () => {
    tripsServiceMock = {
      getMyTrips: vi.fn().mockReturnValue(of([mockMyTrip])),
      getPublicTrips: vi.fn().mockReturnValue(of([mockPublicTrip])),
    };

    await TestBed.configureTestingModule({
      imports: [TripListComponent],
      providers: [
        provideRouter([]),
        { provide: TripsService, useValue: tripsServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TripListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load my trips and public trips on init', () => {
    expect(tripsServiceMock.getMyTrips).toHaveBeenCalled();
    expect(tripsServiceMock.getPublicTrips).toHaveBeenCalled();
  });

  it('should show all trips by default', () => {
    expect(component.filteredTrips().length).toBe(2);
  });

  it('should filter only my trips', () => {
    component.setFilter('mine');
    expect(component.filteredTrips().length).toBe(1);
    expect(component.filteredTrips()[0].id).toBe('1');
  });

  it('should filter only public trips', () => {
    component.setFilter('public');
    expect(component.filteredTrips().length).toBe(1);
    expect(component.filteredTrips()[0].id).toBe('2');
  });

  it('should filter trips by dateFrom', () => {
    component.setDateFrom('2025-07-01');
    expect(component.filteredTrips().length).toBe(1);
    expect(component.filteredTrips()[0].id).toBe('2');
  });

  it('should filter trips by dateTo', () => {
    component.setDateTo('2025-06-30');
    expect(component.filteredTrips().length).toBe(1);
    expect(component.filteredTrips()[0].id).toBe('1');
  });

  it('should show error message when loading fails', () => {
    tripsServiceMock.getMyTrips = vi.fn().mockReturnValue(
      throwError(() => new Error('error'))
    );

    component.ngOnInit();
    expect(component.errorMessage()).toBe('Error cargando tus viajes');
  });
});
