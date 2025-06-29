-- Remove timezone column if it exists (this is causing the error)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE user_profiles DROP COLUMN timezone;
    RAISE NOTICE 'Removed timezone column from user_profiles';
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
    RAISE NOTICE 'Added bio column to user_profiles';
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
    RAISE NOTICE 'Added about_work column to user_profiles';
  END IF;
END $$;

-- Update the updated_at trigger to include new columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for the new columns for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_bio ON user_profiles(bio) WHERE bio IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_about_work ON user_profiles(about_work) WHERE about_work IS NOT NULL;

-- Verify the table structure
DO $$
DECLARE
  column_exists boolean;
BEGIN
  -- Check if timezone column still exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'timezone'
  ) INTO column_exists;
  
  IF column_exists THEN
    RAISE WARNING 'Timezone column still exists - this may cause errors';
  ELSE
    RAISE NOTICE 'Timezone column successfully removed';
  END IF;
  
  -- Check if new columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'bio'
  ) INTO column_exists;
  
  IF column_exists THEN
    RAISE NOTICE 'Bio column exists and ready for use';
  ELSE
    RAISE WARNING 'Bio column missing';
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'about_work'
  ) INTO column_exists;
  
  IF column_exists THEN
    RAISE NOTICE 'About_work column exists and ready for use';
  ELSE
    RAISE WARNING 'About_work column missing';
  END IF;
END $$;