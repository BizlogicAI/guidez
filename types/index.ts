export type FacilityType =
  | 'rehab'
  | 'mental_health'
  | 'hospital'
  | 'detox'
  | 'sober_living';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string | null;
  website: string | null;
  latitude: number;
  longitude: number;
  insurance_accepted: string[];
  hours: string | null;
  description: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  recovery_type: string | null;
  is_anonymous: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  author?: UserProfile;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: UserProfile;
}
