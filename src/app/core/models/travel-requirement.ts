export interface TravelRequirement {
  id: string;
  trip_id: string;
  documentation?: Record<string, unknown>;
  health_info?: Record<string, unknown>;
  currency_info?: Record<string, unknown>;
  last_updated?: string;
}
