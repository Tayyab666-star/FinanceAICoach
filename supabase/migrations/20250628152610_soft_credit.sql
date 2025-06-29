/*
  # Add Test User Account

  1. Create test user account
  2. Add user profile with default values
  3. Ensure proper authentication setup
  
  Note: This creates a test account for development/demo purposes
*/

-- Insert test user into auth.users (if not exists)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'testuser@example.com',
  '$2a$10$rgl8KqwgH.6jI/3StZy1/.Zx9uGJ7fCg8LWNkMDQKZvqQQvpnKWYu', -- password: password123
  now(),
  now(),
  now(),
  '{"name": "Test User"}'::jsonb,
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = now();

-- Insert user profile for test account
INSERT INTO user_profiles (
  id,
  monthly_income,
  monthly_budget,
  setup_completed,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  5000.00,
  4000.00,
  false,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  monthly_income = EXCLUDED.monthly_income,
  monthly_budget = EXCLUDED.monthly_budget,
  setup_completed = EXCLUDED.setup_completed,
  updated_at = now();