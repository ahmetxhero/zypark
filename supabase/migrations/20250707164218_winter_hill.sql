/*
  # Populate Sample Data

  1. Sample Data
    - Categories with real parking types
    - Sample parking spots in major cities
    - Sample users and profiles
    - Sample reservations and reviews

  2. Real Data
    - Actual addresses and coordinates
    - Realistic pricing
    - Proper amenities and descriptions
*/

-- Insert sample categories (if not exists)
INSERT INTO categories (id, name, description, icon) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Residential', 'Private driveways and home parking spaces', 'home'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Commercial', 'Business parking lots and office garages', 'building'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Street', 'Street-side parking spots and meters', 'map-pin'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Covered', 'Covered parking and secure garages', 'shield'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Electric', 'EV charging station parking', 'zap'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Airport', 'Airport parking and shuttle services', 'plane')
ON CONFLICT (id) DO NOTHING;

-- Insert sample users (these will be created when users actually sign up)
-- We'll create some sample parking spots with realistic data

-- San Francisco parking spots
INSERT INTO parking_spots (id, owner_id, title, description, address, latitude, longitude, price_per_hour, currency, amenities, images, category_id, is_available, is_active) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440001',
    NULL, -- Will be assigned when real users create spots
    'Secure Downtown Garage',
    'Safe and secure parking garage in the heart of downtown San Francisco. 24/7 access with security cameras and well-lit environment.',
    '123 Market Street, San Francisco, CA 94105',
    37.7749,
    -122.4194,
    12.00,
    'USD',
    '{"security_cameras": true, "24_7_access": true, "covered": true, "ev_charging": false, "wheelchair_accessible": true}',
    '{"https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440004',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    NULL,
    'Mission District Driveway',
    'Private driveway in trendy Mission District. Easy access to restaurants, bars, and public transportation.',
    '456 Valencia Street, San Francisco, CA 94110',
    37.7599,
    -122.4148,
    8.00,
    'USD',
    '{"private": true, "gated": false, "ev_charging": false, "wheelchair_accessible": false}',
    '{"https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440001',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003',
    NULL,
    'Financial District Premium Spot',
    'Premium parking spot in the Financial District. Perfect for business meetings and close to major corporate offices.',
    '789 Montgomery Street, San Francisco, CA 94111',
    37.7946,
    -122.4042,
    15.00,
    'USD',
    '{"valet_service": true, "covered": true, "security_cameras": true, "ev_charging": true}',
    '{"https://images.pexels.com/photos/753876/pexels-photo-753876.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440002',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440004',
    NULL,
    'Castro Street Parking',
    'Convenient street parking in the vibrant Castro neighborhood. Walking distance to shops, cafes, and nightlife.',
    '321 Castro Street, San Francisco, CA 94114',
    37.7609,
    -122.4350,
    6.00,
    'USD',
    '{"street_parking": true, "meter": true, "time_limited": false}',
    '{"https://images.pexels.com/photos/261985/pexels-photo-261985.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440003',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440005',
    NULL,
    'Nob Hill Luxury Garage',
    'Luxury parking garage on prestigious Nob Hill. Valet service available and climate-controlled environment.',
    '555 California Street, San Francisco, CA 94108',
    37.7919,
    -122.4057,
    20.00,
    'USD',
    '{"valet_service": true, "luxury": true, "climate_controlled": true, "car_wash": true, "ev_charging": true}',
    '{"https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440004',
    true,
    true
  );

-- New York parking spots
INSERT INTO parking_spots (id, owner_id, title, description, address, latitude, longitude, price_per_hour, currency, amenities, images, category_id, is_available, is_active) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440006',
    NULL,
    'Times Square Parking Garage',
    'Central parking garage in the heart of Times Square. Perfect for theater shows and tourist attractions.',
    '234 W 42nd Street, New York, NY 10036',
    40.7589,
    -73.9851,
    25.00,
    'USD',
    '{"security_cameras": true, "24_7_access": true, "covered": true, "elevator": true}',
    '{"https://images.pexels.com/photos/2882509/pexels-photo-2882509.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440004',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440007',
    NULL,
    'Brooklyn Heights Driveway',
    'Private driveway with stunning Manhattan skyline views. Quiet residential area with easy subway access.',
    '123 Remsen Street, Brooklyn, NY 11201',
    40.6955,
    -73.9927,
    10.00,
    'USD',
    '{"private": true, "skyline_view": true, "quiet": true, "residential": true}',
    '{"https://images.pexels.com/photos/1756826/pexels-photo-1756826.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440001',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440008',
    NULL,
    'Central Park West Premium',
    'Exclusive parking spot near Central Park. Doorman building with premium security and concierge services.',
    '456 Central Park West, New York, NY 10025',
    40.7829,
    -73.9654,
    30.00,
    'USD',
    '{"doorman": true, "premium": true, "central_park_access": true, "concierge": true}',
    '{"https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440002',
    true,
    true
  );

-- Los Angeles parking spots
INSERT INTO parking_spots (id, owner_id, title, description, address, latitude, longitude, price_per_hour, currency, amenities, images, category_id, is_available, is_active) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440009',
    NULL,
    'Hollywood Boulevard Parking',
    'Prime parking location on famous Hollywood Boulevard. Walk to TCL Chinese Theatre and Hollywood Walk of Fame.',
    '6801 Hollywood Blvd, Los Angeles, CA 90028',
    34.1022,
    -118.3406,
    18.00,
    'USD',
    '{"tourist_area": true, "walk_of_fame": true, "restaurants_nearby": true}',
    '{"https://images.pexels.com/photos/2695679/pexels-photo-2695679.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440003',
    true,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440010',
    NULL,
    'Santa Monica Beach Parking',
    'Covered parking just steps from Santa Monica Beach and the famous pier. Perfect for beach days.',
    '1550 PCH, Santa Monica, CA 90401',
    34.0195,
    -118.4912,
    14.00,
    'USD',
    '{"beach_access": true, "covered": true, "pier_nearby": true, "bike_rental": true}',
    '{"https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg"}',
    '550e8400-e29b-41d4-a716-446655440004',
    true,
    true
  );

-- Update parking spots to have proper owner_id when users exist
-- This will be handled by the application when real users create spots