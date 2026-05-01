
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityMapListComponent } from './activity-map-list';
import { MatDialog } from '@angular/material/dialog';
import { ActivitiesService } from '../../../core/services/activities.service';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MapService } from '../../../core/services/map.service';

describe('ActivityMapList', () => {
  let component: ActivityMapListComponent;
  let fixture: ComponentFixture<ActivityMapListComponent>;

  const activitiesServiceMock = {
    getActivitiesByTrip: vi.fn().mockReturnValue(of([])),
    deleteActivity: vi.fn().mockReturnValue(of(null))
  };

  const matDialogMock = {
    open: vi.fn()
  };

  beforeEach(async () => {

  await TestBed.configureTestingModule({
    imports: [ActivityMapListComponent],
    providers: [
        { provide: ActivitiesService, useValue: activitiesServiceMock },
        { provide: MatDialog, useValue: matDialogMock },
        {
          provide: MapService,
          useValue: {
            initMap: vi.fn(),
            destroyMap: vi.fn(),
            updateMarkers: vi.fn(),
            invalidateSize: vi.fn()
          }
        }
      ],
    schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityMapListComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('tripId', 'test-trip-123');
    fixture.componentRef.setInput('tripDestinationCoords', { lat: 41.3851, lng: 2.1734 });
    fixture.componentRef.setInput('locations', []);
    fixture.componentRef.setInput('containerId', 'map-container-id');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
