import * as L from 'leaflet';

export interface MapConfig {
  containerId: string;
  center: [number, number];
  zoom: number;
}

export interface MarkerConfig {
  lat: number;
  lng: number;
  icon?: L.Icon;
  draggable?: boolean;
  popup?: string;
}

export interface ActivityMarker {
  activityId: string;
  marker: L.Marker;
}
