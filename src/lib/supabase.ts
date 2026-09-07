import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

export type Profile = {
  id: string;
  full_name: string;
  campus_location: string;
  created_at: string;
};

export type Listing = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'Textbooks' | 'Electronics' | 'Lab Gear' | 'Sports' | 'Misc';
  listing_type: 'Lend' | 'Borrow' | 'Donate';
  pickup_landmark: string;
  image_url: string;
  is_urgent: boolean;
  status: 'active' | 'matched' | 'closed';
  created_at: string;
};

export type Request = {
  id: string;
  listing_id: string;
  requester_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
};

export type ListingWithProfile = Listing & {
  profiles: Profile | null;
};

export type RequestWithListing = Request & {
  listings: Listing | null;
};
