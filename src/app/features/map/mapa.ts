import {
  Component,
  OnInit,
  OnDestroy,
  effect,
  inject,
  Input,
  Output,
  EventEmitter,
  signal,
} from '@angular/core';
import * as L from 'leaflet';
import { ActivitiesService } from '../../core/services/activities.service';
import { MapService } from '../../core/services/map.service';
import { Router } from '@angular/router';
// import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class MapaComponentViejo implements OnInit, OnDestroy {
  public activitiesService = inject(ActivitiesService);
  private mapService = inject(MapService);
  private router = inject(Router);
  // private navigationService = inject(NavigationService);
  @Input() mode: 'view' | 'select' = 'view';
  @Input() initialCoords?: { lat: number; lng: number };
  @Input() showEventMarkers: boolean = true;
  @Input() containerId: string = 'map';
  @Input() centerCoords: [number, number] = [41.40237282641176, 2.194541858893481];
  @Input() zoom: number = 13;

  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();

  private map: L.Map | undefined;
  private userMarker: L.Marker | undefined;
  private eventMarkers: L.Marker[] = [];
  private selectionMarker: L.Marker | undefined;

  // events = this.activitiesService.events;
  selectedLocation = signal<{ lat: number; lng: number } | null>(null);

  constructor() {
    effect(() => {
      const currentEvents = this.activitiesService.mapFilteredActivities();

      if (this.map && this.showEventMarkers && this.mode === 'view') {
        this.paintEventMarkers(currentEvents);
      }
    });

    effect(() => {
      const coords = this.initialCoords;
      if (this.map && coords && this.mode === 'view') {
        this.map.setView([coords.lat, coords.lng], this.zoom);
        if (this.selectionMarker) {
          this.mapService.removeMarker(this.selectionMarker);
        }
        this.selectionMarker = this.mapService.createMarker(this.map, {
          lat: coords.lat,
          lng: coords.lng,
          icon: this.mapService.createSelectionIcon(),
          popup: 'Nueva ubicación seleccionada',
        });
      }
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      // this.activitiesService.updateMapFilter('');
      this.initMap();

      if (this.mode === 'view' && this.showEventMarkers) {
        this.activitiesService.loadEvents();
      }

      if (this.mode === 'select') {
        this.setupSelectionMode();
      }
    }, 0);
    // (window as any).navigateToEvent = (eventId: string) => {
    //   this.navigationService.setPreviousUrl(this.router.url);
    //   this.router.navigate(['/events', eventId]);
    // };
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.mapService.destroyMap(this.containerId);
    }
  }

  private initMap(): void {
    const center = this.initialCoords
      ? ([this.initialCoords.lat, this.initialCoords.lng] as [number, number])
      : this.centerCoords;

    this.map = this.mapService.initMap({
      containerId: this.containerId,
      center,
      zoom: this.zoom,
    });

    if (this.initialCoords && this.mode === 'select') {
      this.placeSelectionMarker(this.initialCoords.lat, this.initialCoords.lng);
    }
    if (this.mode === 'view' && this.initialCoords) {
      this.map.setView(center, this.zoom);
      this.mapService.createMarker(this.map!, {
        lat: this.initialCoords.lat,
        lng: this.initialCoords.lng,
        icon: this.mapService.createSelectionIcon(),
        popup: 'Ubicación del evento',
      });
    }
  }

  private setupSelectionMode(): void {
    if (!this.map) return;

    this.mapService.onMapClick(this.map, (lat, lng) => {
      this.placeSelectionMarker(lat, lng);
    });
  }

  private placeSelectionMarker(lat: number, lng: number): void {
    if (!this.map) return;

    if (this.selectionMarker) {
      this.mapService.removeMarker(this.selectionMarker);
    }

    this.selectionMarker = this.mapService.createMarker(this.map, {
      lat,
      lng,
      icon: this.mapService.createSelectionIcon(),
      draggable: true,
      popup: 'Ubicación seleccionada',
    });

    this.mapService.onMarkerDragEnd(this.selectionMarker, (newLat, newLng) => {
      this.updateSelectedLocation(newLat, newLng);
    });

    this.updateSelectedLocation(lat, lng);
    this.selectionMarker.openPopup();
  }

  private updateSelectedLocation(lat: number, lng: number): void {
    this.selectedLocation.set({ lat, lng });
    this.locationSelected.emit({ lat, lng });
  }

  private paintEventMarkers(events: any[]): void {
    if (!this.map) return;

    this.mapService.removeMarkers(this.eventMarkers);
    this.eventMarkers = [];

    this.eventMarkers = this.mapService.createEventMarkers(this.map, events);

    console.log(`Marcadores pintados: ${this.eventMarkers.length} de ${events.length}`);
  }

  // getLocation(): void {
  //   if (!this.map) return;

  //   this.mapService
  //     .getUserLocation()
  //     .then((coords) => {
  //       if (this.mode === 'view') {
  //         this.showUserLocation(coords);
  //       } else if (this.mode === 'select') {
  //         this.placeSelectionMarker(coords.lat, coords.lng);
  //         this.mapService.setView(this.map!, [coords.lat, coords.lng], 15);
  //       }
  //     })
  //     .catch(() => {
  //       alert('No se pudo obtener la geolocalización');
  //     });
  // }

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
        draggable: true,
        popup: 'Estás aquí',
      });

      this.mapService.onMarkerDragEnd(this.userMarker, (lat, lng) => {
        this.mapService.setView(this.map!, [lat, lng], 19);
        console.log(`Marcador de usuario movido a ${lat}, ${lng}`);
      });

      this.userMarker.openPopup();
    }

    this.mapService.setView(this.map, coordsArray, 15);
  }

  onHobbyChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    // this.activitiesService.updateMapFilter(value);
  }
}
