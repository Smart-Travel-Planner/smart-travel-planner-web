import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LocationsService } from './locations.service';
import { TripLocation } from '../models/location.model';
import { ActivityCategory } from '../enums/activity-category.enum';

describe('LocationsService', () => {
  let service: LocationsService;
  let httpMock: HttpTestingController;

  const mockLocation: TripLocation = {
    id: '1',
    name: 'Museo del Prado',
    category: ActivityCategory.Cultura,
    lat: 40.4138,
    lng: -3.6921,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(LocationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all locations', () => {
    service.getLocations().subscribe(locations => {
      expect(locations.length).toBe(1);
      expect(locations[0].name).toBe('Museo del Prado');
    });

    const req = httpMock.expectOne(req => req.url.includes('/locations'));
    expect(req.request.method).toBe('GET');
    req.flush([mockLocation]);
  });

  it('should get location by id', () => {
    service.getLocationById('1').subscribe(location => {
      expect(location.id).toBe('1');
    });

    const req = httpMock.expectOne(req => req.url.includes('/locations/1'));
    expect(req.request.method).toBe('GET');
    req.flush(mockLocation);
  });

  it('should create a location', () => {
    const newLocation = {
      name: 'Museo del Prado',
      category: ActivityCategory.Cultura,
      lat: 40.4138,
      lng: -3.6921,
    };

    service.createLocation(newLocation).subscribe(location => {
      expect(location.name).toBe('Museo del Prado');
    });

    const req = httpMock.expectOne(req => req.url.includes('/locations'));
    expect(req.request.method).toBe('POST');
    req.flush(mockLocation);
  });

  it('should update a location', () => {
    service.updateLocation('1', { name: 'Museo del Prado actualizado' }).subscribe(location => {
      expect(location.name).toBe('Museo del Prado actualizado');
    });

    const req = httpMock.expectOne(req => req.url.includes('/locations/1'));
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockLocation, name: 'Museo del Prado actualizado' });
  });

  it('should delete a location', () => {
    service.deleteLocation('1').subscribe(response => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(req => req.url.includes('/locations/1'));
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
