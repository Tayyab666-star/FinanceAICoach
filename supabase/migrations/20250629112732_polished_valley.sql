/*
  # Update user profiles table fields

  1. Changes
    - Remove timezone column if it exists
    - Add bio column (text, nullable)
    - Add about_work column (text, nullable)
  
  2. Security
    - Maintain existing RLS policies
    - No changes to existing permissions
*/

-- Remove timezone column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE user_profiles DROP COLUMN timezone;
  END IF;
END $$;

-- Add bio column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN bio text;
  END IF;
END $$;

-- Add about_work column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'about_work'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN about_work text;
  END IF;
END $$;