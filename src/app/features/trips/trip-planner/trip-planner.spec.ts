import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TripPlannerComponent } from './trip-planner';
import { Trip } from '../../../core/models/trip.model';

describe('TripPlanner', () => {
  let component: TripPlannerComponent;
  let fixture: ComponentFixture<TripPlannerComponent>;

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
    await TestBed.configureTestingModule({
      imports: [TripPlannerComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TripPlannerComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('trip', mockTrip);
    fixture.componentRef.setInput('activities', []);
    fixture.componentRef.setInput('locationMap', new Map());

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
