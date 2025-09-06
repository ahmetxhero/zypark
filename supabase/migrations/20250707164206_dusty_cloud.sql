/*
  # Email Verification System

  1. New Tables
    - `email_verifications` - Store verification codes
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - email (text)
      - code (text, 6-digit verification code)
      - expires_at (timestamp)
      - verified (boolean)
      - created_at (timestamp)

  2. Security
    - Enable RLS on verification table
    - Add policies for user access
    - Add cleanup function for expired codes
*/

-- Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own verification codes"
  ON email_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification codes"
  ON email_verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

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

-- Cleanup function for expired codes
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verifications WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;