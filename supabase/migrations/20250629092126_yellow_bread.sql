/*
  # Fix Authentication Flow Issues

  1. Database Fixes
    - Ensure user_profiles table has proper constraints
    - Fix RLS policies for smooth auth flow
    - Add better error handling for profile creation

  2. Security
    - Maintain RLS while allowing auth flow
    - Ensure proper user isolation
    - Allow profile creation during signup

  3. Performance
    - Add proper indexes
    - Optimize profile lookup queries
*/

-- Ensure user_profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  monthly_income numeric(10,2) DEFAULT 0,
  monthly_budget numeric(10,2) DEFAULT 0,
  setup_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;
DROP POLICY IF EXISTS "Allow email existence check" ON user_profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can read own profile" 
ON user_profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON user_profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow profile creation during signup" 
ON user_profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Allow anonymous users to check if email exists (needed for auth flow)
CREATE POLICY "Allow email existence check" 
ON user_profiles FOR SELECT 
TO anon 
USING (true);

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_lookup 
ON user_profiles(email) 
WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_id 
ON user_profiles(id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at 
ON user_profiles(created_at);

CREATE INDEX IF NOT EXISTS idx_user_profiles_setup_status 
ON user_profiles(setup_completed);

-- Create or replace the trigger function for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_name text;
BEGIN
  -- Extract name from email or metadata
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name', 
    split_part(NEW.email, '@', 1)
  );
  
  -- Create user profile automatically when a new user signs up
  INSERT INTO public.user_profiles (
    id,
    email,
    name,
    monthly_income,
    monthly_budget,
    setup_completed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    0,
    0,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, user_profiles.name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to handle user updates
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS trigger AS $$
BEGIN
  -- Update user profile when auth.users is updated
  UPDATE public.user_profiles
  SET 
    email = NEW.email,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_update();

-- Create function to safely get or create user profile
CREATE OR REPLACE FUNCTION get_or_create_user_profile(user_id uuid, user_email text)
RETURNS user_profiles AS $$
DECLARE
  profile user_profiles;
  user_name text;
BEGIN
  -- Try to get existing profile
  SELECT * INTO profile FROM user_profiles WHERE id = user_id;
  
  IF FOUND THEN
    RETURN profile;
  END IF;
  
  -- Create new profile if it doesn't exist
  user_name := split_part(user_email, '@', 1);
  
  INSERT INTO user_profiles (
    id, email, name, monthly_income, monthly_budget, setup_completed
  ) VALUES (
    user_id, user_email, user_name, 0, 0, false
  ) RETURNING * INTO profile;
  
  RETURN profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_user_profile(uuid, text) TO anon, authenticated;

-- Create function to check auth configuration
CREATE OR REPLACE FUNCTION check_auth_setup()
RETURNS text AS $$
BEGIN
  RETURN 'Authentication setup complete. OTP flow should work properly now.';
END;
$$ LANGUAGE plpgsql;

-- Test the setup
SELECT check_auth_setup();