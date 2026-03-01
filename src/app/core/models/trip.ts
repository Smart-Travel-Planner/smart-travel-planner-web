export interface Trip {
  id: string;
  title: string;
  user_id: string;
  image_url?: string;
  start_date: string;
  end_date?: string;
  total_budget: number;
  is_public: boolean;
  created_at: string;
}

export interface CreateTripRequest {
  title: string;
  start_date: string;
  end_date?: string;
  total_budget: number;
  is_public: boolean;
  image_url?: string;
}

export interface UpdateTripRequest {
  title?: string;
  start_date?: string;
  end_date?: string;
  total_budget?: number;
  is_public?: boolean;
  image_url?: string;
}
