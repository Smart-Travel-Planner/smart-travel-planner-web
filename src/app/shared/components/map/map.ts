import { Component, effect, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from '../../../core/services/map.service';
import { Activity } from '../../../core/models/activity.model';
import { ActivityMarker } from '../../../core/models/map-apis.model';
import { TripLocation } from '../../../core/models/location.model';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class MapComponent implements OnInit, OnDestroy {
  private mapService = inject(MapService);

  @Input() mode: 'view' | 'select' = 'view';
  @Input() containerId: string = 'map';
  @Input() centerCoords: [number, number] = [41.40237282641176, 2.194541858893481];
  @Input() zoom: number = 13;
  @Input() initialCoords?: { lat: number; lng: number};
  @Input() set activities(value: Activity[]) {
    this._activities.set(value);
  };
  @Input() set locations(value: TripLocation[]) {
    this._locations.set(value);
  };
  @Input() set centerLocation(value: TripLocation | null) {
    this._centerLocation.set(value);
  };

  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number}>;
  @Output() markerClicked = new EventEmitter<string>();
  @Output() locationMarkerClicked = new EventEmitter<string>();

  private _activities = signal<Activity[]>([]);
  private _locations = signal<TripLocation[]>([]);
  private _centerLocation = signal<TripLocation | null>(null);
  private map: L.Map | undefined;
  private activityMarkers: ActivityMarker[] = [];
  private locationMarkers: Map<string, L.Marker> = new Map();
  private selectionMarker: L.Marker | undefined;
  private userMarker: L.Marker | undefined;
  selectedActivityId = signal<string | null>(null);
  selectedLocationId = signal<string | null>(null);

  constructor() {
    effect(() => {
      const activities = this._activities();
      const locations = this._locations();
      if (this.mode !== 'view' || activities.length === 0) return;

      if (this.map) {
        this.paintActivityMarkers(activities, locations);
      } else {
        setTimeout(() => {
          if (this.map) {
            this.paintActivityMarkers(activities, locations);
          }
        }, 100);
      };
    });
    effect(() => {
      const locations = this._locations();
      if (locations.length === 0) return;
      if (this._activities().length > 0) return;

      if (this.map) {
        this.paintLocationMarkers(locations);
      } else {
        setTimeout(() => {
          if (this.map) {
            this.paintLocationMarkers(locations);
          }
        }, 100);
      };
    });
    effect(() => {
      const location = this._centerLocation();
      if (!location) return;

      if (this.map) {
        this.mapService.createMarker(this.map, {
          lat: location.lat,
          lng: location.lng,
          icon: this.mapService.createDefaultIcon(),
          popup: location.name,
        });
      } else {
        setTimeout(() => {
          if (this.map) {
            this.mapService.createMarker(this.map, {
              lat: location.lat,
              lng: location.lng,
              icon: this.mapService.createDefaultIcon(),
              popup: location.name,
            });
          }
        }, 100)
      }
    });
  };

  ngOnInit(): void {
    setTimeout(() => {
      this.initMap();
      setTimeout(() => {
        this.mapService.invalidateSize(this.containerId);
        console.log('after invalidate, tiles:', document.querySelectorAll('.leaflet-tile').length);
        console.log('after invalidate, size:', this.map?.getSize());
      }, 100);
      if (this.mode === 'select') {
        this.setupSelectionMode();
      };

      if (this.initialCoords && this.mode === 'select') {
        this.placeSelectionMarker(this.initialCoords.lat, this.initialCoords.lng);
      };
    }, 0);
  };

  ngOnDestroy(): void {
    if (this.map) {
      this.mapService.destroyMap(this.containerId);
    };
  };

  private initMap(): void {
    let center: [number, number];

    if (this.initialCoords) {
      center = [this.initialCoords.lat, this.initialCoords.lng];
    } else {
      center = this.centerCoords;
    };

    this.map = this.mapService.initMap({
      containerId: this.containerId,
      center,
      zoom: this.zoom,
    });
  };

  private setupSelectionMode(): void {
    if (!this.map) return;

    this.mapService.onMapClick(this.map, (lat, lng) => {
      this.placeSelectionMarker(lat, lng);
    });
  };

  private placeSelectionMarker(lat: number, lng: number): void {
    if (!this.map) return;

    if (this.selectionMarker) {
      this.mapService.removeMarker(this.selectionMarker);
    };

    this.selectionMarker = this.mapService.createMarker(this.map, {
      lat,
      lng,
      icon: this.mapService.createSelectionIcon(),
      draggable: true,
      popup: 'Ubicación seleccionada',
    });

    this.mapService.onMarkerDragEnd(this.selectionMarker, (newLat, newLng) => {
      this.updatedSelectedLocation(newLat, newLng);
    });

    this.updatedSelectedLocation(lat, lng);
    this.selectionMarker.openPopup();
  };

  private updatedSelectedLocation(lat: number, lng: number): void {
    this.locationSelected.emit({lat, lng});
  };

  private paintActivityMarkers(activities: Activity[], locations: TripLocation[]): void {
    if (!this.map) return;

    this.mapService.removeMarkers(this.activityMarkers.map(am => am.marker));
    this.activityMarkers = [];

    const locationMap = new Map(locations.map(l => [l.id, l]));

    activities.forEach(activity => {
      if (!activity.location_id) return;

      const location = locationMap.get(activity.location_id);
      if (!location) return;

      const marker = this.mapService.createMarker(this.map!, {
        lat: location.lat,
        lng: location.lng,
        icon: this.mapService.createDefaultIcon(),
        popup: activity.title,
      });

      marker.on('click', () => {
        this.selectedActivityId.set(activity.id);
        this.markerClicked.emit(activity.id);
        this.highlightActivity(activity.id);
      });

      this.activityMarkers.push({ activityId: activity.id, marker });
    });
  };

  private paintLocationMarkers(locations: TripLocation[]): void {
    if (!this.map) return;

    this.locationMarkers.forEach(marker => this.mapService.removeMarker(marker));
    this.locationMarkers.clear();

    locations.forEach(location => {
      const marker = this.mapService.createMarker(this.map!, {
        lat: location.lat,
        lng: location.lng,
        icon: this.mapService.createDefaultIcon(),
        popup: location.name,
      });

      marker.on('click', () => {
        this.highlightLocationMarker(location.id);
        this.locationMarkerClicked.emit(location.id);
      });

      this.locationMarkers.set(location.id, marker);
    });
  };

  highlightActivity(activityId: string): void {
    this.selectedActivityId.set(activityId);

    this.activityMarkers.forEach(({ activityId: id, marker}) => {
      marker.setIcon(
        id === activityId
          ? this.mapService.createActiveIcon()
          : this.mapService.createDefaultIcon()
      );

      if (id === activityId) {
        marker.openPopup();
        const latLng = marker.getLatLng();
        this.mapService.setView(this.map!, [latLng.lat, latLng.lng], this.zoom);
      };
    });
  };

  highlightLocationMarker(locationId: string): void {
    this.selectedLocationId.set(locationId);

    this.locationMarkers.forEach((marker, id) => {
      marker.setIcon(
        id === locationId
          ? this.mapService.createActiveIcon()
          : this.mapService.createDefaultIcon()
      );

      if (id === locationId) {
        marker.openPopup();
        const latLng = marker.getLatLng();
        this.mapService.setView(this.map!, [latLng.lat, latLng.lng], this.zoom);
      };
    });
  };

  getUserLocation(): void {
    if (!this.map) return;

    this.mapService.getUserLocation()
      .then(coords => {
        if (this.mode === 'view') {
          this.showUserLocation(coords);
        } else {
          this.placeSelectionMarker(coords.lat, coords.lng);
          this.mapService.setView(this.map!, [coords.lat, coords.lng], 15);
        };
      })
      .catch(() => console.error('No se pudo obtener la geolocalización'));
  };

  private showUserLocation(coords: { lat: number; lng: number}): void {
    if (!this.map) return;

    const coordsArray: [number, number] = [coords.lat, coords.lng];

    if (this.userMarker) {
      this.userMarker.setLatLng(coordsArray).openPopup();
    } else {
      this.userMarker = this.mapService.createMarker(this.map, {
        lat: coords.lat,
        lng: coords.lng,
        icon: this.mapService.createUserIcon(),
        draggable: false,
        popup: 'Estás aquí',
      });
    };

    this.mapService.setView(this.map, coordsArray, 15);
  };
};
