import { ActivityCategory } from '../enums/activity-category.enum';

export interface Location {
  id: string;
  name: string;
  address?: string;
  category: ActivityCategory;
  created_by?: string;
  is_verified?: boolean;
  lat: number;
  lng: number;
  rating?: number;
  place_id?: string;
}
