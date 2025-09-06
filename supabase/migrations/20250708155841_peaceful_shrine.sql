/*
  # Add User Preferences

  1. Changes
    - Add language preference column
    - Add dark mode preference
    - Add notification settings
    - Add sound settings
    - Update profiles table with new columns

  2. Security
    - Maintain existing RLS policies
    - Ensure user data privacy
*/

-- Add new columns to profiles table
DO $$
BEGIN
  -- Add language column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'language'
  ) THEN
    ALTER TABLE profiles ADD COLUMN language text DEFAULT 'en';
  END IF;

  -- Add dark_mode column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'dark_mode'
  ) THEN
    ALTER TABLE profiles ADD COLUMN dark_mode boolean DEFAULT false;
  END IF;

  -- Add notifications_enabled column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'notifications_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN notifications_enabled boolean DEFAULT true;
  END IF;

  -- Add sound_enabled column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'sound_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sound_enabled boolean DEFAULT true;
  END IF;
END $$;

-- Create index for language queries
CREATE INDEX IF NOT EXISTS idx_profiles_language ON profiles(language);

-- Update existing profiles with default values
UPDATE profiles 
SET 
  language = COALESCE(language, 'en'),
  dark_mode = COALESCE(dark_mode, false),
  notifications_enabled = COALESCE(notifications_enabled, true),
  sound_enabled = COALESCE(sound_enabled, true)
WHERE language IS NULL OR dark_mode IS NULL OR notifications_enabled IS NULL OR sound_enabled IS NULL;