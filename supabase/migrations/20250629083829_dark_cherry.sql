/*
  # Configure OTP Authentication System
  
  1. Database Functions
    - Helper functions for user management
    - Profile management functions
    - Authentication utilities
  
  2. Security
    - Proper RLS policies
    - Function permissions
    - Secure user operations
    
  3. Performance
    - Optimized indexes
    - Efficient queries
*/

-- Create helper function to check if user exists (using RLS-safe approach)
CREATE OR REPLACE FUNCTION public.check_user_exists(user_email text)
RETURNS boolean AS $$
BEGIN
  -- Use user_profiles table instead of auth.users to avoid permission issues
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION public.check_user_exists(text) TO anon, authenticated;

-- Create function to get user profile by email
CREATE OR REPLACE FUNCTION public.get_user_profile_by_email(user_email text)
RETURNS TABLE(id uuid, email text, name text, setup_completed boolean) AS $$
BEGIN
  RETURN QUERY
  SELECT up.id, up.email, up.name, up.setup_completed
  FROM public.user_profiles up
  WHERE up.email = user_email
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_profile_by_email(text) TO anon, authenticated;

-- Create function to safely create or update user profile
CREATE OR REPLACE FUNCTION public.upsert_user_profile(
  user_id uuid,
  user_email text,
  user_name text DEFAULT NULL
)
RETURNS public.user_profiles AS $$
DECLARE
  result public.user_profiles;
BEGIN
  -- Insert or update user profile
  INSERT INTO public.user_profiles (
    id, 
    email, 
    name, 
    setup_completed,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_email,
    COALESCE(user_name, split_part(user_email, '@', 1)),
    false,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, user_profiles.name),
    updated_at = now()
  RETURNING * INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.upsert_user_profile(uuid, text, text) TO anon, authenticated;

-- Create function to handle user authentication flow
CREATE OR REPLACE FUNCTION public.handle_user_auth(user_email text)
RETURNS jsonb AS $$
DECLARE
  user_exists boolean;
  user_profile public.user_profiles;
BEGIN
  -- Check if user exists
  SELECT public.check_user_exists(user_email) INTO user_exists;
  
  IF user_exists THEN
    -- Get existing user profile
    SELECT * INTO user_profile 
    FROM public.user_profiles 
    WHERE email = user_email 
    LIMIT 1;
    
    RETURN jsonb_build_object(
      'exists', true,
      'user_id', user_profile.id,
      'email', user_profile.email,
      'name', user_profile.name,
      'setup_completed', user_profile.setup_completed,
      'action', 'login'
    );
  ELSE
    RETURN jsonb_build_object(
      'exists', false,
      'email', user_email,
      'action', 'signup'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.handle_user_auth(text) TO anon, authenticated;

-- Create function to log authentication attempts (for debugging)
CREATE OR REPLACE FUNCTION public.log_auth_attempt(
  user_email text,
  attempt_type text,
  success boolean DEFAULT true,
  error_message text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Simple logging function that can be extended
  -- For now, just raise a notice for debugging
  RAISE NOTICE 'Auth attempt: % - % - Success: % - Error: %', 
    user_email, attempt_type, success, COALESCE(error_message, 'None');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.log_auth_attempt(text, text, boolean, text) TO anon, authenticated;

-- Ensure proper indexes exist on user_profiles for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_lookup 
ON public.user_profiles(email) 
WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at 
ON public.user_profiles(created_at);

CREATE INDEX IF NOT EXISTS idx_user_profiles_setup_status 
ON public.user_profiles(setup_completed);

-- Update RLS policies to be more permissive for authentication flow
DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;

-- Create more specific RLS policies
CREATE POLICY "Users can read own profile" 
ON public.user_profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow profile creation during signup" 
ON public.user_profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Allow anonymous users to check if email exists (for auth flow)
CREATE POLICY "Allow email existence check" 
ON public.user_profiles FOR SELECT 
TO anon 
USING (true);

-- Create a configuration table for app settings
CREATE TABLE IF NOT EXISTS public.app_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on app_config
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read app config
CREATE POLICY "Allow reading app config" 
ON public.app_config FOR SELECT 
TO authenticated 
USING (true);

-- Insert default configuration values
INSERT INTO public.app_config (key, value, description) VALUES 
  ('auth_method', 'otp', 'Authentication method: otp or magic_link'),
  ('otp_length', '6', 'Length of OTP codes'),
  ('otp_expiry_minutes', '10', 'OTP expiry time in minutes'),
  ('enable_signup', 'true', 'Allow new user signups'),
  ('require_email_confirmation', 'true', 'Require email confirmation for new users')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- Create function to get app configuration
CREATE OR REPLACE FUNCTION public.get_app_config(config_key text)
RETURNS text AS $$
DECLARE
  config_value text;
BEGIN
  SELECT value INTO config_value 
  FROM public.app_config 
  WHERE key = config_key;
  
  RETURN config_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_app_config(text) TO anon, authenticated;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to app_config table
DROP TRIGGER IF EXISTS update_app_config_updated_at ON public.app_config;
CREATE TRIGGER update_app_config_updated_at
  BEFORE UPDATE ON public.app_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a simple notification function for successful setup
CREATE OR REPLACE FUNCTION public.notify_otp_setup_complete()
RETURNS text AS $$
BEGIN
  RETURN 'OTP authentication system configured successfully. Use Supabase Dashboard to enable Email OTP and disable Magic Links in Authentication > Settings.';
END;
$$ LANGUAGE plpgsql;

-- Call the notification function
SELECT public.notify_otp_setup_complete();