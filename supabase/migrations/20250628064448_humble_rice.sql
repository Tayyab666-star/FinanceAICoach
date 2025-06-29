/*
  # Update user profiles with dummy data for existing users

  1. Changes
    - Update existing user profiles to have dummy income and budget values
    - Set setup_completed to false so users can update the dummy values
  
  2. Security
    - Only updates profiles that don't already have income/budget set
*/

-- Update existing user profiles that don't have income/budget set
UPDATE user_profiles 
SET 
  monthly_income = 10000,
  monthly_budget = 8000,
  setup_completed = false,
  updated_at = now()
WHERE 
  monthly_income IS NULL 
  OR monthly_budget IS NULL 
  OR (monthly_income = 0 AND monthly_budget = 0);