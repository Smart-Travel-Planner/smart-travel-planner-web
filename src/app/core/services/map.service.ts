import { Injectable } from '@angular/core';
import { ActivityMarker, MapConfig, MarkerConfig } from '../models/map-apis.model';
import * as L from 'leaflet';
import { Activity } from '../models/activity.model';
import { TripLocation } from '../models/location.model';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private maps: Map<string, L.Map> = new Map();

  initMap(config: MapConfig): L.Map {
    this.destroyMap(config.containerId);

    const map = L.map(config.containerId).setView(config.center, config.zoom);

    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: '&copy; OpenStreetMap contributors',
    // }).addTo(map);
    // L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    // }).addTo(map);
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&hl=es&x={x}&y={y}&z={z}', { // temporal
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: 'Mapas de Google'
    }).addTo(map);

    this.maps.set(config.containerId, map);

    return map;
  };

  destroyMap(containerId: string): void {
    const map = this.maps.get(containerId);
    if (map) {
      map.remove();
      this.maps.delete(containerId);
    };
  };

  getMap(containerId: string): L.Map | undefined {
    return this.maps.get(containerId);
  };

  createMarker(map: L.Map, config: MarkerConfig): L.Marker {
    const marker = L.marker([config.lat, config.lng], {
      icon: config.icon || this.createDefaultIcon(),
      draggable: config.draggable || false,
    }).addTo(map);

    if (config.popup) {
      marker.bindPopup(config.popup);
    };
    return marker;
  };

  removeMarker(marker: L.Marker): void {
    marker.remove();
  };

  removeMarkers(markers: L.Marker[]): void {
    markers.forEach((marker) => marker.remove());
  };

  setView(map: L.Map, coords: [number, number], zoom?: number): void {
    map.setView(coords, zoom || map.getZoom());
  };

  getUserLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      };
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  onMapClick(map: L.Map, callback: (lat: number, lng: number) => void): void {
    map.on('click', (e: L.LeafletMouseEvent) => {
      callback(e.latlng.lat, e.latlng.lng);
    });
  };

  onMarkerDragEnd(marker: L.Marker, callback: (lat: number, lng: number) => void): void {
    marker.on('dragend', (event) => {
      const position = event.target.getLatLng();
      callback(position.lat, position.lng);
    });
  };

  createDefaultIcon(): L.Icon {
    return L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  createActiveIcon(): L.Icon {
    return L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  createUserIcon(): L.Icon {
    return L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  createSelectionIcon(): L.Icon {
    return L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  invalidateSize(containerId: string): void {
    const map = this.maps.get(containerId);
    if (map) map.invalidateSize();
  };

  paintActivityMarkers(
    map: L.Map,
    activities: Activity[],
    locations: TripLocation[],
    onMarkerClick: (activityId: string) => void
  ): ActivityMarker[] {
    const locationMap = new Map(locations.map(l => [l.id, l]));
    const activityMarkers: ActivityMarker[] = [];

    activities.forEach(activity => {
      if (!activity.location_id) return;
      const location = locationMap.get(activity.location_id);
      if (!location) return;

      const marker = this.createMarker(map, {
        lat: location.lat,
        lng: location.lng,
        icon: this.createDefaultIcon(),
        popup: activity.title,
      });

      marker.on('click', () => onMarkerClick(activity.id));

      setTimeout(() => {
        const el = marker.getElement();
        if (el) {
          el.setAttribute('tabindex', '0');
          el.setAttribute('aria-label', activity.title);
          el.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onMarkerClick(activity.id);
            }
          });
        }
      }, 100);

      activityMarkers.push({ activityId: activity.id, marker });
    });

    return activityMarkers;
  };

  paintLocationMarkers(
    map: L.Map,
    locations: TripLocation[],
    onMarkerClick: (locationId: string) => void
  ): Map<string, L.Marker> {
    const locationMarkers = new Map<string, L.Marker>();

    locations.forEach(location => {
      const marker = this.createMarker(map, {
        lat: location.lat,
        lng: location.lng,
        icon: this.createDefaultIcon(),
        popup: location.name,
      });

      marker.on('click', () => onMarkerClick(location.id));
      locationMarkers.set(location.id, marker);
    });

    return locationMarkers;
  };

  highlightActivityMarker(
    activityMarkers: ActivityMarker[],
    activityId: string,
    map: L.Map,
    zoom: number
  ): void {
    activityMarkers.forEach(({ activityId: id, marker }) => {
      marker.setIcon(id === activityId ? this.createActiveIcon() : this.createDefaultIcon());
      if (id === activityId) {
        marker.openPopup();
        const latLng = marker.getLatLng();
        this.setView(map, [latLng.lat, latLng.lng], zoom);
      };
    });
  };

  highlightLocationMarker(
    locationMarkers: Map<string, L.Marker>,
    locationId: string,
    map: L.Map,
    zoom: number
  ): void {
    locationMarkers.forEach((marker, id) => {
      marker.setIcon(id === locationId ? this.createActiveIcon() : this.createDefaultIcon());
      if (id === locationId) {
        marker.openPopup();
        const latLng = marker.getLatLng();
        this.setView(map, [latLng.lat, latLng.lng], zoom);
      };
    });
  };
};
