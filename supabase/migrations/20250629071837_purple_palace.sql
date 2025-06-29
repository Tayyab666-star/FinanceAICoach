/*
  # Set Random Passwords for Existing User Profiles

  1. Changes
    - Update all existing user profiles in auth.users with random passwords (1-10)
    - Ensure all profiles have a simple numeric password for testing
  
  2. Security
    - This is for development/testing purposes only
    - Sets simple passwords for easy access to existing accounts
*/

-- Update existing users with random passwords from 1 to 10
DO $$
DECLARE
    user_record RECORD;
    random_password TEXT;
BEGIN
    -- Loop through all existing users in auth.users
    FOR user_record IN 
        SELECT id, email FROM auth.users 
    LOOP
        -- Generate random password between 1 and 10
        random_password := (floor(random() * 10) + 1)::text;
        
        -- Update the user's password
        UPDATE auth.users 
        SET 
            encrypted_password = crypt(random_password, gen_salt('bf')),
            updated_at = now()
        WHERE id = user_record.id;
        
        -- Log the update (for debugging purposes)
        RAISE NOTICE 'Updated user % with password %', user_record.email, random_password;
    END LOOP;
END $$;

-- Also ensure all user profiles have proper email addresses
UPDATE user_profiles 
SET email = (
    SELECT email 
    FROM auth.users 
    WHERE auth.users.id = user_profiles.id
)
WHERE email IS NULL OR email = '';

-- Update any missing names in user_profiles
UPDATE user_profiles 
SET name = COALESCE(
    name,
    (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = user_profiles.id),
    split_part(email, '@', 1)
)
WHERE name IS NULL OR name = '';

-- Ensure all profiles are marked as setup completed if they have income/budget
UPDATE user_profiles 
SET setup_completed = true
WHERE (monthly_income > 0 OR monthly_budget > 0) AND setup_completed = false;