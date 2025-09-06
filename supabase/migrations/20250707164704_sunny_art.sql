/*
  # Complete ZyPark Database Setup

  1. Email Verification System
    - Create email_verifications table
    - Add verification functions
    - Set up proper RLS policies

  2. Sample Data Population
    - Add realistic parking spots
    - Create proper categories
    - Set up user statistics

  3. Database Functions
    - Email verification workflow
    - User statistics calculation
    - Data cleanup functions
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create email_verifications table if not exists
CREATE TABLE IF NOT EXISTS email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on email_verifications
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for email_verifications
DROP POLICY IF EXISTS "Users can view their own verification codes" ON email_verifications;
CREATE POLICY "Users can view their own verification codes"
  ON email_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own verification codes" ON email_verifications;
CREATE POLICY "Users can insert their own verification codes"
  ON email_verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own verification codes" ON email_verifications;
CREATE POLICY "Users can update their own verification codes"
  ON email_verifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to generate verification code
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS text AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to create verification code
CREATE OR REPLACE FUNCTION create_verification_code(user_email text, user_id_param uuid)
RETURNS text AS $$
DECLARE
  verification_code text;
BEGIN
  -- Generate 6-digit code
  verification_code := generate_verification_code();
  
  -- Delete any existing codes for this user
  DELETE FROM email_verifications WHERE user_id = user_id_param;
  
  -- Insert new verification code
  INSERT INTO email_verifications (user_id, email, code, expires_at)
  VALUES (user_id_param, user_email, verification_code, now() + interval '10 minutes');
  
  RETURN verification_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify code
CREATE OR REPLACE FUNCTION verify_email_code(user_id_param uuid, code_param text)
RETURNS boolean AS $$
DECLARE
  is_valid boolean := false;
BEGIN
  -- Check if code exists and is not expired
  SELECT EXISTS(
    SELECT 1 FROM email_verifications 
    WHERE user_id = user_id_param 
    AND code = code_param 
    AND expires_at > now() 
    AND verified = false
  ) INTO is_valid;
  
  IF is_valid THEN
    -- Mark as verified
    UPDATE email_verifications 
    SET verified = true 
    WHERE user_id = user_id_param AND code = code_param;
    
    -- Update user as email confirmed
    UPDATE auth.users 
    SET email_confirmed_at = now() 
    WHERE id = user_id_param;
  END IF;
  
  RETURN is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample categories (if not exists)
INSERT INTO categories (id, name, description, icon) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Residential', 'Private driveways and home parking spaces', 'home'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Commercial', 'Business parking lots and office garages', 'building'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Street', 'Street-side parking spots and meters', 'map-pin'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Covered', 'Covered parking and secure garages', 'shield'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Electric', 'EV charging station parking', 'zap'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Airport', 'Airport parking and shuttle services', 'plane')
ON CONFLICT (id) DO NOTHING;

-- Clear existing sample data
DELETE FROM parking_spots WHERE owner_id IS NULL;

-- Insert comprehensive sample parking spots
INSERT INTO parking_spots (id, owner_id, title, description, address, latitude, longitude, price_per_hour, currency, amenities, images, category_id, is_available, is_active) VALUES
  -- San Francisco spots
  (
    '660e8400-e29b-41d4-a716-446655440001',
    NULL,
    'Downtown Financial District Garage',
    'Premium secure parking in the heart of San Francisco''s Financial District. 24/7 access with security cameras, valet service available.',
    '123 Market Street, San Francisco, CA 94105',
    37.7749,
    -122.4194,
    15.00,
    'USD',
    '{"security_cameras": true, "24_7_access": true, "covered": true, "valet_service": true, "ev_charging": true}',
    '{"https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440004',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    NULL,
    'Mission District Private Driveway',
    'Convenient private driveway in the trendy Mission District. Walking distance to restaurants, bars, and BART station.',
    '456 Valencia Street, San Francisco, CA 94110',
    37.7599,
    -122.4148,
    8.00,
    'USD',
    '{"private": true, "gated": false, "ev_charging": false, "restaurants_nearby": true}',
    '{"https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440001',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003',
    NULL,
    'Union Square Premium Parking',
    'Prime location near Union Square shopping district. Perfect for shopping trips and business meetings.',
    '789 Stockton Street, San Francisco, CA 94108',
    37.7880,
    -122.4074,
    20.00,
    'USD',
    '{"shopping_nearby": true, "covered": true, "security_cameras": true, "elevator": true}',
    '{"https://images.pexels.com/photos/753876/pexels-photo-753876.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440002',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440004',
    NULL,
    'Castro Neighborhood Street Parking',
    'Convenient street parking in the vibrant Castro neighborhood. Close to shops, cafes, and nightlife.',
    '321 Castro Street, San Francisco, CA 94114',
    37.7609,
    -122.4350,
    6.00,
    'USD',
    '{"street_parking": true, "meter": false, "nightlife_nearby": true, "cafes_nearby": true}',
    '{"https://images.pexels.com/photos/261985/pexels-photo-261985.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440003',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440005',
    NULL,
    'Nob Hill Luxury Garage',
    'Exclusive parking in prestigious Nob Hill. Valet service, car wash, and climate-controlled environment.',
    '555 California Street, San Francisco, CA 94108',
    37.7919,
    -122.4057,
    25.00,
    'USD',
    '{"valet_service": true, "luxury": true, "climate_controlled": true, "car_wash": true, "ev_charging": true}',
    '{"https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440004',
    true,
    true
  ),
  
  -- New York spots
  (
    '660e8400-e29b-41d4-a716-446655440006',
    NULL,
    'Times Square Theater District Garage',
    'Central parking garage in Times Square. Perfect for Broadway shows and tourist attractions.',
    '234 W 42nd Street, New York, NY 10036',
    40.7589,
    -73.9851,
    30.00,
    'USD',
    '{"theater_district": true, "24_7_access": true, "covered": true, "elevator": true, "tourist_area": true}',
    '{"https://images.pexels.com/photos/2882509/pexels-photo-2882509.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440004',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440007',
    NULL,
    'Brooklyn Heights Waterfront Driveway',
    'Private driveway with stunning Manhattan skyline views. Quiet residential area with subway access.',
    '123 Remsen Street, Brooklyn, NY 11201',
    40.6955,
    -73.9927,
    12.00,
    'USD',
    '{"private": true, "skyline_view": true, "quiet": true, "subway_access": true}',
    '{"https://images.pexels.com/photos/1756826/pexels-photo-1756826.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440001',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440008',
    NULL,
    'Central Park West Premium Spot',
    'Exclusive parking near Central Park. Doorman building with premium security and concierge services.',
    '456 Central Park West, New York, NY 10025',
    40.7829,
    -73.9654,
    35.00,
    'USD',
    '{"doorman": true, "premium": true, "central_park_access": true, "concierge": true}',
    '{"https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440002',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440009',
    NULL,
    'Wall Street Business District',
    'Professional parking in the Financial District. Perfect for business meetings and corporate events.',
    '60 Wall Street, New York, NY 10005',
    40.7074,
    -74.0113,
    28.00,
    'USD',
    '{"business_district": true, "security_cameras": true, "covered": true, "corporate": true}',
    '{"https://images.pexels.com/photos/936722/pexels-photo-936722.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440002',
    true,
    true
  ),
  
  -- Los Angeles spots
  (
    '660e8400-e29b-41d4-a716-446655440010',
    NULL,
    'Hollywood Boulevard Entertainment District',
    'Prime parking on famous Hollywood Boulevard. Walk to TCL Chinese Theatre and Hollywood Walk of Fame.',
    '6801 Hollywood Blvd, Los Angeles, CA 90028',
    34.1022,
    -118.3406,
    18.00,
    'USD',
    '{"tourist_area": true, "walk_of_fame": true, "entertainment": true, "restaurants_nearby": true}',
    '{"https://images.pexels.com/photos/2695679/pexels-photo-2695679.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440003',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440011',
    NULL,
    'Santa Monica Beach Covered Parking',
    'Covered parking steps from Santa Monica Beach and the famous pier. Perfect for beach days.',
    '1550 PCH, Santa Monica, CA 90401',
    34.0195,
    -118.4912,
    16.00,
    'USD',
    '{"beach_access": true, "covered": true, "pier_nearby": true, "bike_rental": true}',
    '{"https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440004',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440012',
    NULL,
    'Beverly Hills Shopping District',
    'Luxury parking in Beverly Hills shopping area. Close to Rodeo Drive and high-end boutiques.',
    '9500 Wilshire Blvd, Beverly Hills, CA 90212',
    34.0669,
    -118.3959,
    22.00,
    'USD',
    '{"luxury": true, "shopping": true, "valet_service": true, "rodeo_drive": true}',
    '{"https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440002',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440013',
    NULL,
    'LAX Airport Long-term Parking',
    'Secure long-term parking near LAX airport with shuttle service. Perfect for travelers.',
    '9000 Airport Blvd, Los Angeles, CA 90045',
    33.9425,
    -118.4081,
    10.00,
    'USD',
    '{"airport_shuttle": true, "long_term": true, "security_cameras": true, "covered": true}',
    '{"https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440006',
    true,
    true
  ),
  
  -- Additional spots for variety
  (
    '660e8400-e29b-41d4-a716-446655440014',
    NULL,
    'Electric Vehicle Charging Station',
    'Dedicated EV charging parking spot with Tesla Supercharger and universal charging options.',
    '1234 Green Street, San Francisco, CA 94109',
    37.7956,
    -122.4297,
    12.00,
    'USD',
    '{"ev_charging": true, "tesla_supercharger": true, "universal_charging": true, "eco_friendly": true}',
    '{"https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440005',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440015',
    NULL,
    'Fisherman''s Wharf Tourist Parking',
    'Convenient parking near Fisherman''s Wharf attractions. Close to Pier 39 and Alcatraz ferry.',
    '2800 Leavenworth Street, San Francisco, CA 94133',
    37.8080,
    -122.4177,
    14.00,
    'USD',
    '{"tourist_area": true, "pier_39": true, "alcatraz_ferry": true, "seafood_restaurants": true}',
    '{"https://images.pexels.com/photos/261985/pexels-photo-261985.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440003',
    true,
    true
  );

-- Insert sample reservations for demonstration
INSERT INTO reservations (id, parking_spot_id, user_id, start_time, end_time, total_price, status) VALUES
  (
    '770e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    NULL, -- Will be populated when real users exist
    now() + interval '1 day',
    now() + interval '1 day' + interval '2 hours',
    30.00,
    'confirmed'
  ),
  (
    '770e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440002',
    NULL,
    now() - interval '1 day',
    now() - interval '1 day' + interval '3 hours',
    24.00,
    'completed'
  );

-- Create function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_id_param uuid)
RETURNS TABLE(
  bookings_count bigint,
  spots_count bigint,
  total_spent numeric,
  total_earned numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE((SELECT COUNT(*) FROM reservations WHERE user_id = user_id_param), 0) as bookings_count,
    COALESCE((SELECT COUNT(*) FROM parking_spots WHERE owner_id = user_id_param AND is_active = true), 0) as spots_count,
    COALESCE((SELECT SUM(total_price) FROM reservations WHERE user_id = user_id_param), 0) as total_spent,
    COALESCE((SELECT SUM(r.total_price) FROM reservations r JOIN parking_spots ps ON r.parking_spot_id = ps.id WHERE ps.owner_id = user_id_param), 0) as total_earned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup function for expired verification codes
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verifications WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_verification_code(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_email_code(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_verification_codes() TO authenticated;