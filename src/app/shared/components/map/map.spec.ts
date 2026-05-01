
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapComponent } from './map';
import { MapService } from '../../../core/services/map.service';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let mapServiceMock: any;

  beforeEach(async () => {
    mapServiceMock = {
      initMap: vi.fn().mockReturnValue({}),
      destroyMap: vi.fn(),
      invalidateSize: vi.fn(),
      paintActivityMarkers: vi.fn().mockReturnValue([]),
      paintLocationMarkers: vi.fn().mockReturnValue(new Map()),
      removeMarkers: vi.fn(),
      removeMarker: vi.fn(),
      createMarker: vi.fn().mockReturnValue({
        openPopup: vi.fn(),
        on: vi.fn(),
        setLatLng: vi.fn().mockReturnThis(),
      }),
      onMapClick: vi.fn(),
      onMarkerDragEnd: vi.fn(),
      createDefaultIcon: vi.fn(),
      createSelectionIcon: vi.fn(),
      createUserIcon: vi.fn(),
      setView: vi.fn(),
      getUserLocation: vi.fn().mockResolvedValue({ lat: 41.4, lng: 2.1 }),
      highlightActivityMarker: vi.fn(),
      highlightLocationMarker: vi.fn(),
    };

    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [MapComponent],
      providers: [
        { provide: MapService, useValue: mapServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the map after the first tick of ngOnInit', async () => {
    fixture.detectChanges();

    vi.advanceTimersByTime(0);

    expect(mapServiceMock.initMap).toHaveBeenCalled();
    expect(component['_mapReady']()).toBe(true);
  });

  it('should call invalidateSize after 100ms', async () => {
    fixture.detectChanges();

    vi.advanceTimersByTime(100);

    expect(mapServiceMock.invalidateSize).toHaveBeenCalledWith(component.containerId);
  });

  it('should configure the selection mode when the input mode is "select"', async () => {
    fixture.componentRef.setInput('mode', 'select');
    fixture.detectChanges();

    vi.advanceTimersByTime(0);

    expect(mapServiceMock.onMapClick).toHaveBeenCalled();
  });

  it('should place an initial marker if initialCoords are provided in select mode', async () => {
    const coords = { lat: 40, lng: 2 };
    fixture.componentRef.setInput('mode', 'select');
    fixture.componentRef.setInput('initialCoords', coords);
    fixture.detectChanges();

    vi.advanceTimersByTime(0);

    expect(mapServiceMock.createMarker).toHaveBeenCalled();
  });


  it('getUserLocation should position the map after resolving the promise', async () => {
    (component as any).map = {};

    await component.getUserLocation();

    expect(mapServiceMock.getUserLocation).toHaveBeenCalled();
    expect(mapServiceMock.setView).toHaveBeenCalled();
  });

  it('panTo should call the service setView if the map exists', () => {
    (component as any).map = {};
    component.panTo(10, 10);
    expect(mapServiceMock.setView).toHaveBeenCalledWith(expect.anything(), [10, 10], component.zoom);
  });

  it('should destroy the map by destroying the component', () => {
    (component as any).map = {};
    fixture.destroy();
    expect(mapServiceMock.destroyMap).toHaveBeenCalledWith(component.containerId);
  });
});
