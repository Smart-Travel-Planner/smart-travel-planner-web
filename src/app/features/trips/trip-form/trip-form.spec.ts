import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { TripFormComponent } from './trip-form';
import { TripsService } from '../../../core/services/trips.service';
import { Trip } from '../../../core/models/trip.model';

describe('TripFormComponent', () => {
  let component: TripFormComponent;
  let fixture: ComponentFixture<TripFormComponent>;
  let tripsServiceMock: Partial<TripsService>;

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
      createTrip: vi.fn().mockReturnValue(of(mockTrip)),
      updateTrip: vi.fn().mockReturnValue(of(mockTrip)),
    };

    await TestBed.configureTestingModule({
      imports: [TripFormComponent],
      providers: [
        provideRouter([]),
        { provide: TripsService, useValue: tripsServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TripFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in create mode by default', () => {
    expect(component.isEditMode()).toBe(false);
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(tripsServiceMock.createTrip).not.toHaveBeenCalled();
  });

  it('should call createTrip on submit in create mode', () => {
    component.tripForm.setValue({
      title: 'Viaje a Roma',
      destination: '',
      start_date: '2025-07-01',
      end_date: '',
      total_budget: 500,
      is_public: false,
      image_url: '',
    });

    component.onSubmit();
    expect(tripsServiceMock.createTrip).toHaveBeenCalled();
  });

  it('should show error message when create fails', () => {
    (tripsServiceMock.createTrip as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => new Error('error'))
    );

    component.tripForm.setValue({
      title: 'Viaje a Roma',
      destination: '',
      start_date: '2025-07-01',
      end_date: '',
      total_budget: 500,
      is_public: false,
      image_url: '',
    });

    component.onSubmit();
    expect(component.errorMessage()).toBe('Error creando el viaje');
  });

  it('should load trip and be in edit mode when id is present', async () => {
    await TestBed.configureTestingModule({
      imports: [TripFormComponent],
      providers: [
        provideRouter([]),
        { provide: TripsService, useValue: tripsServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
      ],
    }).compileComponents();

    const editFixture = TestBed.createComponent(TripFormComponent);
    const editComponent = editFixture.componentInstance;
    await editFixture.whenStable();

    expect(editComponent.isEditMode()).toBe(true);
    expect(tripsServiceMock.getTripById).toHaveBeenCalledWith('1');
  });

  it('should call updateTrip on submit in edit mode', () => {
    component.isEditMode.set(true);
    component.tripId.set('1');

    component.tripForm.setValue({
      title: 'Viaje a París actualizado',
      destination: '',
      start_date: '2025-06-01',
      end_date: '',
      total_budget: 1000,
      is_public: false,
      image_url: '',
    });

    component.onSubmit();
    expect(tripsServiceMock.updateTrip).toHaveBeenCalledWith('1', expect.any(Object));
  });

  it('should show error message when update fails', () => {
    (tripsServiceMock.updateTrip as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => new Error('error'))
    );

    component.isEditMode.set(true);
    component.tripId.set('1');

    component.tripForm.setValue({
      title: 'Viaje a París actualizado',
      destination: '',
      start_date: '2025-06-01',
      end_date: '',
      total_budget: 1000,
      is_public: false,
      image_url: '',
    });

    component.onSubmit();
    expect(component.errorMessage()).toBe('Error actualizando el viaje');
  });
});
