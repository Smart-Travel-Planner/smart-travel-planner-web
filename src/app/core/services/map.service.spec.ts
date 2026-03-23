import { TestBed } from '@angular/core/testing';
import { MapService } from './map.service';

describe('MapService', () => {
  let service: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapService);

    const div = document.createElement('div');
    div.id = 'test-map';
    div.style.width = '400px';
    div.style.height = '400px';
    document.body.appendChild(div);
  });

  afterEach(() => {
    service.destroyMap('test-map');
    const div = document.getElementById('test-map');
    if (div) document.body.removeChild(div);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should init a map', () => {
    const map = service.initMap({
      containerId: 'test-map',
      center: [40.4168, -3.7038],
      zoom: 13,
    });
    expect(map).toBeDefined();
  });

  it('should destroy a map', () => {
    service.initMap({
      containerId: 'test-map',
      center: [40.4168, -3.7038],
      zoom: 13,
    });
    service.destroyMap('test-map');
    expect(service.getMap('test-map')).toBeUndefined();
  });

  it('should return undefined for non-existing map', () => {
    expect(service.getMap('non-existing')).toBeUndefined();
  });

  it('should create default icon', () => {
    const icon = service.createDefaultIcon();
    expect(icon).toBeDefined();
  });

  it('should create active icon', () => {
    const icon = service.createActiveIcon();
    expect(icon).toBeDefined();
  });

  it('should create selection icon', () => {
    const icon = service.createSelectionIcon();
    expect(icon).toBeDefined();
  });

  it('should create user icon', () => {
    const icon = service.createUserIcon();
    expect(icon).toBeDefined();
  });

  it('should reject getUserLocation if geolocation not supported', async () => {
    Object.defineProperty(window.navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    });

    await expect(service.getUserLocation()).rejects.toThrow('Geolocalización no soportada');
  });
});
