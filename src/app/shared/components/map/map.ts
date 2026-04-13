
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
  @Input() initialCoords?: { lat: number; lng: number };
  @Input() set activities(value: Activity[]) {
    this._activitiesProvided.set(true);
    this._activities.set(value);
  };
  @Input() set locations(value: TripLocation[]) {
    this._locations.set(value);
  }
  @Input() set centerLocation(value: TripLocation | null) {
    this._centerLocation.set(value);
  };

  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();
  @Output() markerClicked = new EventEmitter<string>();
  @Output() locationMarkerClicked = new EventEmitter<string>();

  private _activities = signal<Activity[]>([]);
  private _locations = signal<TripLocation[]>([]);
  private _centerLocation = signal<TripLocation | null>(null);
  private _activitiesProvided = signal(false);
  private _mapReady = signal(false);

  private map: L.Map | undefined;
  private activityMarkers: ActivityMarker[] = [];
  private locationMarkers: Map<string, L.Marker> = new Map();
  private selectionMarker: L.Marker | undefined;
  private userMarker: L.Marker | undefined;

  selectedActivityId = signal<string | null>(null);
  selectedLocationId = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (!this._mapReady()) return;
      if (this.mode !== 'view') return;
      const activities = this._activities();
      const locations = this._locations();
      this.mapService.removeMarkers(this.activityMarkers.map(am => am.marker));
      this.activityMarkers = this.mapService.paintActivityMarkers(
        this.map!,
        activities,
        locations,
        (activityId) => {
          this.selectedActivityId.set(activityId);
          this.markerClicked.emit(activityId);
          this.highlightActivity(activityId);
        }
      );
    });

    effect(() => {
      if (!this._mapReady()) return;
      if (this._activitiesProvided()) return;
      const locations = this._locations();
      if (locations.length === 0) return;
      this.locationMarkers.forEach(marker => this.mapService.removeMarker(marker));
      this.locationMarkers = this.mapService.paintLocationMarkers(
        this.map!,
        locations,
        (locationId) => {
          this.highlightLocationMarker(locationId);
          this.locationMarkerClicked.emit(locationId);
        }
      );
    });

    effect(() => {
      if (!this._mapReady()) return;
      const location = this._centerLocation();
      if (!location) return;
      this.mapService.createMarker(this.map!, {
        lat: location.lat,
        lng: location.lng,
        icon: this.mapService.createDefaultIcon(),
        popup: location.name,
      });
    });
  };

  ngOnInit(): void {
    setTimeout(() => {
      this.initMap();
      this._mapReady.set(true);
      setTimeout(() => {
        this.mapService.invalidateSize(this.containerId);
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
    const center = this.initialCoords
      ? [this.initialCoords.lat, this.initialCoords.lng] as [number, number]
      : this.centerCoords;

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
      this.locationSelected.emit({ lat: newLat, lng: newLng });
    });
    this.locationSelected.emit({ lat, lng });
    this.selectionMarker.openPopup();
  };

  highlightActivity(activityId: string): void {
    this.selectedActivityId.set(activityId);
    this.mapService.highlightActivityMarker(
      this.activityMarkers,
      activityId,
      this.map!,
      this.zoom
    );
  };

  highlightLocationMarker(locationId: string): void {
    this.selectedLocationId.set(locationId);
    this.mapService.highlightLocationMarker(
      this.locationMarkers,
      locationId,
      this.map!,
      this.zoom
    );
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

  private showUserLocation(coords: { lat: number; lng: number }): void {
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
