import { Injectable } from '@angular/core';
import { MapConfig, MarkerConfig } from '../models/map-apis.model';
import * as L from 'leaflet';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private maps: Map<string, L.Map> = new Map();

  initMap(config: MapConfig): L.Map {
    this.destroyMap(config.containerId);

    const map = L.map(config.containerId).setView(config.center, config.zoom);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    this.maps.set(config.containerId, map);

    return map;
  }

  destroyMap(containerId: string): void {
    const map = this.maps.get(containerId);
    if (map) {
      map.remove();
      this.maps.delete(containerId);
    }
  }

  getMap(containerId: string): L.Map | undefined {
    return this.maps.get(containerId);
  }

  createMarker(map: L.Map, config: MarkerConfig): L.Marker {
    const marker = L.marker([config.lat, config.lng], {
      icon: config.icon || this.createDefaultIcon(),
      draggable: config.draggable || false,
    }).addTo(map);

    if (config.popup) {
      marker.bindPopup(config.popup);
    }

    return marker;
  }

  // createEventMarkers(map: L.Map, events: any[]): L.Marker[] {
  //   const markers: L.Marker[] = [];

  //   events.forEach((event) => {
  //     if (!event.lat || !event.lng || (event.lat === 0 && event.lng === 0)) {
  //       console.warn('Evento sin coordenadas válidas:', event.title);
  //       return;
  //     }

  //     try {
  //       const marker = this.createMarker(map, {
  //         lat: event.lat,
  //         lng: event.lng,
  //         icon: this.createEventIcon(),
  //         popup: this.createEventPopupContent(event),
  //       });

  //       markers.push(marker);
  //     } catch (error) {
  //       console.error('❌ Error creando marcador:', error, event);
  //     }
  //   });

  //   return markers;
  // }

  removeMarker(marker: L.Marker): void {
    marker.remove();
  }

  removeMarkers(markers: L.Marker[]): void {
    markers.forEach((marker) => marker.remove());
  }

  setView(map: L.Map, coords: [number, number], zoom?: number): void {
    map.setView(coords, zoom || map.getZoom());
  }

  getUserLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

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
  }

  onMapClick(map: L.Map, callback: (lat: number, lng: number) => void): void {
    map.on('click', (e: L.LeafletMouseEvent) => {
      callback(e.latlng.lat, e.latlng.lng);
    });
  }

  onMarkerDragEnd(marker: L.Marker, callback: (lat: number, lng: number) => void): void {
    marker.on('dragend', (event) => {
      const position = event.target.getLatLng();
      callback(position.lat, position.lng);
    });
  }
  createDefaultIcon(): L.Icon {
    return L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  createActiveIcon(): L.Icon {
    return L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  createUserIcon(): L.Icon {
    return L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  createSelectionIcon(): L.Icon {
    return L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  // private createEventPopupContent(event: any): string {
  //   const hobbyText = Array.isArray(event.hobby)
  //     ? event.hobby.join(', ')
  //     : event.hobby;

  //   return `
  //     <div style="min-width: 250px; font-family: system-ui;">
  //       <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #333; font-weight: 600;">
  //         ${event.title}
  //       </h4>
  //       <p style="margin: 8px 0; font-size: 13px; color: #666; line-height: 1.4;">
  //         ${event.description}
  //       </p>
  //       <button
  //         onclick="window.navigateToEvent('${event._id}')"
  //         style="
  //           width: 100%;
  //           margin-top: 12px;
  //           padding: 8px 16px;
  //           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  //           color: white;
  //           border: none;
  //           border-radius: 6px;
  //           font-size: 13px;
  //           font-weight: 600;
  //           cursor: pointer;
  //           transition: transform 0.2s;
  //         "
  //         onmouseover="this.style.transform='scale(1.05)'"
  //         onmouseout="this.style.transform='scale(1)'">
  //         👁️ Ver detalles completos
  //       </button>
  //     </div>
  //   `;
  // }
}
