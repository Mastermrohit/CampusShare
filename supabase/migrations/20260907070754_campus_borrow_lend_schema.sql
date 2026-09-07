/*
# Campus Borrow & Lend — Initial Schema

## Overview
Creates the core tables for a campus item-sharing platform where students
can list items to lend, borrow, or donate, and request items from others.

## New Tables

### profiles
- `id` (uuid, primary key, references auth.users)
- `full_name` (text, the student's display name)
- `campus_location` (text, default pickup landmark, e.g. "Student Union")
- `created_at` (timestamptz)

### listings
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles, defaults to auth.uid())
- `title` (text, item name)
- `description` (text, item details)
- `category` (text, one of: Books, Electronics, Lab Gear, Miscellaneous)
- `listing_type` (text, one of: Lend, Borrow, Donate)
- `pickup_landmark` (text, campus location for pickup)
- `image_url` (text, optional item photo)
- `is_urgent` (boolean, whether this is an urgent request)
- `status` (text, one of: active, matched, closed; default: active)
- `created_at` (timestamptz)

### requests
- `id` (uuid, primary key)
- `listing_id` (uuid, references listings, cascade delete)
- `requester_id` (uuid, references profiles, defaults to auth.uid())
- `message` (text, optional message to the owner)
- `status` (text, one of: pending, accepted, declined; default: pending)
- `created_at` (timestamptz)

## Security
- RLS enabled on all tables.
- profiles: each authenticated user can read all profiles (to see item owners)
  but only update their own.
- listings: all authenticated users can read (browse the feed); only the owner
  can insert/update/delete their own listings.
- requests: all authenticated users can read requests they are involved in
  (as requester or listing owner); only the requester can create/update/delete
  their own requests.

## Notes
1. `user_id` and `requester_id` columns default to `auth.uid()` so client
   inserts that omit the owner still satisfy RLS WITH CHECK.
2. A request is visible to both the requester and the listing owner so they
   can communicate about the item.
3. The `is_urgent` flag powers the "Urgent Requests" section on the homepage.
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  campus_location text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL CHECK (category IN ('Books', 'Electronics', 'Lab Gear', 'Miscellaneous')),
  listing_type text NOT NULL CHECK (listing_type IN ('Lend', 'Borrow', 'Donate')),
  pickup_landmark text NOT NULL,
  image_url text DEFAULT '',
  is_urgent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matched', 'closed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listings_select_all" ON listings;
CREATE POLICY "listings_select_all"
  ON listings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "listings_insert_own" ON listings;
CREATE POLICY "listings_insert_own"
  ON listings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "listings_update_own" ON listings;
CREATE POLICY "listings_update_own"
  ON listings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "listings_delete_own" ON listings;
CREATE POLICY "listings_delete_own"
  ON listings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  message text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "requests_select_involved" ON requests;
CREATE POLICY "requests_select_involved"
  ON requests FOR SELECT
  TO authenticated USING (
    requester_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = requests.listing_id
      AND listings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "requests_insert_own" ON requests;
CREATE POLICY "requests_insert_own"
  ON requests FOR INSERT
  TO authenticated WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS "requests_update_own" ON requests;
CREATE POLICY "requests_update_own"
  ON requests FOR UPDATE
  TO authenticated USING (requester_id = auth.uid()) WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS "requests_delete_own" ON requests;
CREATE POLICY "requests_delete_own"
  ON requests FOR DELETE
  TO authenticated USING (requester_id = auth.uid());

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_listing_type ON listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_is_urgent ON listings(is_urgent);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_listing_id ON requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_requests_requester_id ON requests(requester_id);
