/*
# ZyPark Database Schema

## Overview
This migration creates the complete database schema for ZyPark parking rental app.

## New Tables
1. **profiles** - User profile information
   - id (uuid, references auth.users)
   - email, full_name, avatar_url
   - phone, vehicle_info
   - created_at, updated_at

2. **parking_spots** - Available parking spots
   - id (uuid, primary key)
   - owner_id (uuid, references profiles)
   - title, description, address
   - latitude, longitude
   - price_per_hour, currency
   - amenities (jsonb)
   - images (text array)
   - is_available, is_active
   - created_at, updated_at

3. **reservations** - Booking records
   - id (uuid, primary key)
   - parking_spot_id (uuid, references parking_spots)
   - user_id (uuid, references profiles)
   - start_time, end_time
   - total_price, status
   - created_at, updated_at

4. **payments** - Payment transactions
   - id (uuid, primary key)
   - reservation_id (uuid, references reservations)
   - user_id (uuid, references profiles)
   - amount, currency, status
   - payment_method, transaction_id
   - created_at, updated_at

5. **reviews** - User reviews and ratings
   - id (uuid, primary key)
   - parking_spot_id (uuid, references parking_spots)
   - user_id (uuid, references profiles)
   - rating, comment
   - created_at, updated_at

6. **categories** - Parking spot categories
   - id (uuid, primary key)
   - name, description, icon
   - created_at, updated_at

## Security
- Enable RLS on all tables
- Create policies for authenticated users
- Ensure users can only access their own data
- Allow public read access to parking spots and categories
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  phone text,
  vehicle_info jsonb DEFAULT '{}',
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create parking_spots table
CREATE TABLE IF NOT EXISTS parking_spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  address text NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  price_per_hour decimal(10, 2) NOT NULL,
  currency text DEFAULT 'USD',
  amenities jsonb DEFAULT '{}',
  images text[] DEFAULT '{}',
  category_id uuid REFERENCES categories(id),
  is_available boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parking_spot_id uuid REFERENCES parking_spots(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  total_price decimal(10, 2) NOT NULL,
  status reservation_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL,
  currency text DEFAULT 'USD',
  status payment_status DEFAULT 'pending',
  payment_method text,
  transaction_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parking_spot_id uuid REFERENCES parking_spots(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parking_spots_location ON parking_spots USING gist(point(longitude, latitude));
CREATE INDEX IF NOT EXISTS idx_parking_spots_owner ON parking_spots(owner_id);
CREATE INDEX IF NOT EXISTS idx_reservations_spot ON reservations(parking_spot_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_time ON reservations(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_reviews_spot ON reviews(parking_spot_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for parking_spots
CREATE POLICY "Anyone can view active parking spots"
  ON parking_spots FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can manage their own parking spots"
  ON parking_spots FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create RLS policies for reservations
CREATE POLICY "Users can view their own reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Spot owners can view reservations for their spots"
  ON reservations FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT owner_id FROM parking_spots WHERE id = parking_spot_id
  ));

CREATE POLICY "Users can create reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for payments
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated;

CREATE POLICY "Users can manage their own reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for categories
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated;

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Insert default categories
INSERT INTO categories (name, description, icon) VALUES
  ('Residential', 'Private driveways and home parking', 'home'),
  ('Commercial', 'Business parking lots and garages', 'building'),
  ('Street', 'Street-side parking spots', 'map-pin'),
  ('Covered', 'Covered or garage parking', 'shield'),
  ('Electric', 'EV charging station parking', 'zap'),
  ('Motorcycle', 'Motorcycle and scooter parking', 'bike')
ON CONFLICT DO NOTHING;

-- Create function to prevent overlapping reservations
CREATE OR REPLACE FUNCTION prevent_overlapping_reservations()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM reservations
    WHERE parking_spot_id = NEW.parking_spot_id
    AND status IN ('pending', 'confirmed')
    AND (
      (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
      (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
      (NEW.start_time <= start_time AND NEW.end_time >= end_time)
    )
  ) THEN
    RAISE EXCEPTION 'Parking spot is already reserved for this time period';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent overlapping reservations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_overlapping_reservations_trigger') THEN
    CREATE TRIGGER prevent_overlapping_reservations_trigger
      BEFORE INSERT OR UPDATE ON reservations
      FOR EACH ROW EXECUTE FUNCTION prevent_overlapping_reservations();
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_parking_spots_updated_at') THEN
    CREATE TRIGGER update_parking_spots_updated_at
      BEFORE UPDATE ON parking_spots
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reservations_updated_at') THEN
    CREATE TRIGGER update_reservations_updated_at
      BEFORE UPDATE ON reservations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;