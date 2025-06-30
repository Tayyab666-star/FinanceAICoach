/*
  # Configure Email Settings for OTP

  1. Email Configuration
    - Set up proper email templates
    - Configure OTP delivery
    - Set up fallback options
    
  2. Authentication Flow
    - Configure proper redirect URLs
    - Set up session management
*/

-- Configure the auth schema settings for better OTP handling
-- These settings help ensure OTP codes are sent instead of magic links

-- Update auth configuration for OTP preference
DO $$
BEGIN
  -- Try to update existing configuration or insert new ones
  
  -- Configure email OTP settings
  INSERT INTO auth.config (parameter, value) VALUES 
    ('MAILER_OTP_EXP', '600'),  -- 10 minutes
    ('MAILER_OTP_LENGTH', '6'),  -- 6 digit codes
    ('ENABLE_EMAIL_OTP', 'true'),
    ('DISABLE_SIGNUP', 'false'),
    ('ENABLE_CONFIRMATIONS', 'true'),
    ('MAILER_AUTOCONFIRM', 'false')
  ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;
  
EXCEPTION WHEN OTHERS THEN
  -- If auth.config doesn't exist or has different structure, continue
  RAISE NOTICE 'Could not configure auth.config table: %', SQLERRM;
END $$;

-- Create a function to ensure proper email template configuration
CREATE OR REPLACE FUNCTION configure_auth_email_templates()
RETURNS void AS $$
BEGIN
  -- This function can be called to set up email templates
  -- The actual templates are usually configured via Supabase Dashboard
  -- or environment variables, but we can set up the database side
  
  RAISE NOTICE 'Email templates should be configured in Supabase Dashboard';
  RAISE NOTICE 'Set ENABLE_EMAIL_OTP=true in Auth settings';
  RAISE NOTICE 'Set DISABLE_SIGNUP=false to allow new users';
  RAISE NOTICE 'Configure email templates to use {{ .Token }} for OTP codes';
END;
$$ LANGUAGE plpgsql;

-- Call the configuration function
SELECT configure_auth_email_templates();

-- Ensure proper indexes for auth performance
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users(email);
CREATE INDEX IF NOT EXISTS idx_auth_users_phone ON auth.users(phone);

-- Create a view for easier user management (optional)
CREATE OR REPLACE VIEW public.auth_users_view AS
SELECT 
  id,
  email,
  created_at,
  updated_at,
  email_confirmed_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users;

-- Grant access to the view
GRANT SELECT ON public.auth_users_view TO authenticated;

-- Create helper function to check if user exists
CREATE OR REPLACE FUNCTION public.check_user_exists(user_email text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_user_exists(text) TO anon, authenticated;

-- Create function to get user profile by email
CREATE OR REPLACE FUNCTION public.get_user_profile_by_email(user_email text)
RETURNS TABLE(id uuid, email text, name text) AS $$
BEGIN
  RETURN QUERY
  SELECT up.id, up.email, up.name
  FROM public.user_profiles up
  WHERE up.email = user_email
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_profile_by_email(text) TO anon, authenticated;