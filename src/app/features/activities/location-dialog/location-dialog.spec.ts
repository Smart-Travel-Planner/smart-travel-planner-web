import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Component, Input } from '@angular/core';
import { LocationDialogComponent } from './location-dialog';
import { LocationsService } from '../../../core/services/locations.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MapComponent } from '../../../shared/components/map/map';
import { ActivityCategory } from '../../../core/enums/activity-category.enum';
import { TripLocation } from '../../../core/models/location.model';

@Component({ selector: 'app-map', template: '' })
class MapStubComponent {
  @Input() mode: string = 'select';
  @Input() containerId: string = '';
  @Input() centerCoords: any;
}

describe('LocationDialogComponent', () => {
  let component: LocationDialogComponent;
  let fixture: ComponentFixture<LocationDialogComponent>;
  let locationsServiceMock: Partial<LocationsService>;
  let dialogRefMock: Partial<MatDialogRef<LocationDialogComponent>>;

  const mockLocation: TripLocation = {
    id: 'loc1',
    name: 'Museo del Prado',
    category: ActivityCategory.Cultura,
    lat: 40.4138,
    lng: -3.6921,
  };

  beforeEach(async () => {
    locationsServiceMock = {
      createLocation: vi.fn().mockReturnValue(of(mockLocation)),
    };

    dialogRefMock = {
      close: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LocationDialogComponent],
      providers: [
        { provide: LocationsService, useValue: locationsServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: { tripDestinationCoords: { lat: 48.8566, lng: 2.3522 } } },
      ],
    })
    .overrideComponent(LocationDialogComponent, {
      remove: { imports: [MapComponent] },
      add: { imports: [MapStubComponent] },
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(locationsServiceMock.createLocation).not.toHaveBeenCalled();
  });

  it('should call createLocation on submit with valid form', () => {
    component.locationForm.setValue({
      name: 'Museo del Prado',
      category: ActivityCategory.Cultura,
      lat: 40.4138,
      lng: -3.6921,
      address: '',
      rating: null,
      place_id: '',
    });

    component.onSubmit();
    expect(locationsServiceMock.createLocation).toHaveBeenCalled();
  });

  it('should close dialog with location on success', () => {
    component.locationForm.setValue({
      name: 'Museo del Prado',
      category: ActivityCategory.Cultura,
      lat: 40.4138,
      lng: -3.6921,
      address: '',
      rating: null,
      place_id: '',
    });

    component.onSubmit();
    expect(dialogRefMock.close).toHaveBeenCalledWith(mockLocation);
  });

  it('should close dialog with null on cancel', () => {
    component.onCancel();
    expect(dialogRefMock.close).toHaveBeenCalledWith(null);
  });

  it('should show error message when create fails', () => {
    (locationsServiceMock.createLocation as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => new Error('error'))
    );

    component.locationForm.setValue({
      name: 'Museo del Prado',
      category: ActivityCategory.Cultura,
      lat: 40.4138,
      lng: -3.6921,
      address: '',
      rating: null,
      place_id: '',
    });

    component.onSubmit();
    expect(component.errorMessage()).toBe('Error creando la ubicación');
  });

  it('should update form coords when location is selected on map', () => {
    component.onLocationSelected({ lat: 41.3851, lng: 2.1734 });
    expect(component.locationForm.get('lat')?.value).toBe(41.3851);
    expect(component.locationForm.get('lng')?.value).toBe(2.1734);
  });
});
