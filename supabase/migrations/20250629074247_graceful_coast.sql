/*
  # Clear only authenticated users from auth table
  
  This migration only removes users from the auth.users table while preserving
  all application data in user_profiles and other tables.
  
  1. Clear authenticated users from auth.users table only
  2. Keep all user_profiles, transactions, goals, budgets data intact
  3. This allows the application to work without authentication while preserving data
*/

-- Only clear users from auth.users table
-- This removes authentication but keeps all application data
DELETE FROM auth.users;

-- Reset the auth sequence if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users_id_seq' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')) THEN
    PERFORM setval('auth.users_id_seq', 1, false);
  END IF;
END $$;