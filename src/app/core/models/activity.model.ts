import { ActivityCategory } from "../enums/activity-category.enum";

export interface Activity {
  id: string;
  trip_id: string;
  location_id?: string;
  title: string;
  start_time: string;
  end_time?: string;
  cost: number;
  user_notes?: string;
  category: ActivityCategory;
}

export interface CreateActivityRequest {
  title: string;
  trip_id: string;
  start_time: string;
  cost: number;
  category: ActivityCategory;
  location_id?: string;
  end_time?: string;
  user_notes?: string;
}

export interface UpdateActivityRequest {
  title?: string;
  start_time?: string;
  cost?: number;
  category?: ActivityCategory;
  location_id?: string;
  end_time?: string;
  user_notes?: string;
}
