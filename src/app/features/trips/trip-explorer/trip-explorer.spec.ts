import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Component, Input } from '@angular/core';
import { TripExplorerComponent } from './trip-explorer';
import { GeocodingService } from '../../../core/services/geocoding.service';
import { MapComponent } from '../../../shared/components/map/map';
import { Trip } from '../../../core/models/trip.model';

@Component({ selector: 'app-map', template: '', standalone: true })
class MapStubComponent {
  @Input() activities: any[] = [];
  @Input() locations: any[] = [];
  @Input() destinationCoords: any;
  @Input() centerCoords: any;
  highlightActivity = vi.fn();
}

describe('TripExplorer', () => {
  let component: TripExplorerComponent;
  let fixture: ComponentFixture<TripExplorerComponent>;

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
      imports: [TripExplorerComponent],
      providers: [
        {
          provide: GeocodingService,
          useValue: {
            getCoordsByDestination: vi.fn().mockReturnValue(of({ lat: 48.8566, lng: 2.3522 })),
            getUserLocationOrDefault: vi.fn().mockResolvedValue({ lat: 48.8566, lng: 2.3522 }),
          },
        },
      ],
    })
    .overrideComponent(TripExplorerComponent, {
      remove: { imports: [MapComponent] },
      add: { imports: [MapStubComponent] },
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripExplorerComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('trip', mockTrip);
    fixture.componentRef.setInput('activities', []);
    fixture.componentRef.setInput('locations', []);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
