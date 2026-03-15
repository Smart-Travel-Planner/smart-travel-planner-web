import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TripsService } from './trips.service';
import { Trip } from '../models/trip.model';

describe('TripsService', () => {
  let service: TripsService;
  let httpMock: HttpTestingController;

  const mockTrip: Trip = {
    id: '1',
    user_id: 'user1',
    title: 'Viaje a París',
    start_date: '2025-06-01',
    is_public: false,
    total_budget: 1000,
    created_at: '2025-01-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(TripsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get my trips', () => {
    service.getMyTrips().subscribe(trips => {
      expect(trips.length).toBe(1);
      expect(trips[0].title).toBe('Viaje a París');
    });

    const req = httpMock.expectOne(req => req.url.includes('/trips/my-trips'));
    expect(req.request.method).toBe('GET');
    req.flush([mockTrip]);
  });

  it('should get public trips', () => {
    service.getPublicTrips().subscribe(trips => {
      expect(trips.length).toBe(1);
    });

    const req = httpMock.expectOne(req => req.url.includes('/trips/public'));
    expect(req.request.method).toBe('GET');
    req.flush([mockTrip]);
  });

  it('should get trip by id', () => {
    service.getTripById('1').subscribe(trip => {
      expect(trip.id).toBe('1');
    });

    const req = httpMock.expectOne(req => req.url.includes('/trips/1'));
    expect(req.request.method).toBe('GET');
    req.flush(mockTrip);
  });

  it('should create a trip', () => {
    const newTrip = { title: 'Viaje a Roma', start_date: '2025-07-01', is_public: false, total_budget: 500 };

    service.createTrip(newTrip).subscribe(trip => {
      expect(trip.title).toBe('Viaje a Roma');
    });

    const req = httpMock.expectOne(req => req.url.includes('/trips'));
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockTrip, ...newTrip });
  });

  it('should update a trip', () => {
    service.updateTrip('1', { title: 'Viaje a París actualizado' }).subscribe(trip => {
      expect(trip.title).toBe('Viaje a París actualizado');
    });

    const req = httpMock.expectOne(req => req.url.includes('/trips/1'));
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockTrip, title: 'Viaje a París actualizado' });
  });

  it('should delete a trip', () => {
    service.deleteTrip('1').subscribe(response => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(req => req.url.includes('/trips/1'));
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
