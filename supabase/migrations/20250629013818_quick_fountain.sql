/*
  # Simplify Authentication System

  1. Changes
    - Add email and name columns to user_profiles
    - Update RLS policies to work without auth.users dependency
    - Allow public access with simplified authentication
  
  2. Security
    - Remove dependency on auth.users
    - Create simplified policies for public access
*/

-- Add email column to user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email text UNIQUE;
  END IF;
END $$;

-- Add name column to user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN name text;
  END IF;
END $$;

-- Drop all existing policies for user_profiles
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "select_own_data" ON user_profiles;

-- Create new policy for user_profiles
CREATE POLICY "public_access_user_profiles"
  ON user_profiles
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Drop all existing policies for transactions
DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
DROP POLICY IF EXISTS "select_own_data" ON transactions;
DROP POLICY IF EXISTS "insert_own_data" ON transactions;
DROP POLICY IF EXISTS "update_own_data" ON transactions;
DROP POLICY IF EXISTS "delete_own_data" ON transactions;

-- Create new policy for transactions
CREATE POLICY "public_access_transactions"
  ON transactions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Drop all existing policies for goals
DROP POLICY IF EXISTS "Users can read own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
DROP POLICY IF EXISTS "Users can update own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
DROP POLICY IF EXISTS "select_own_data" ON goals;
DROP POLICY IF EXISTS "insert_own_data" ON goals;
DROP POLICY IF EXISTS "update_own_data" ON goals;
DROP POLICY IF EXISTS "delete_own_data" ON goals;

-- Create new policy for goals
CREATE POLICY "public_access_goals"
  ON goals
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Drop all existing policies for budgets
DROP POLICY IF EXISTS "Users can read own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;
DROP POLICY IF EXISTS "select_own_data" ON budgets;
DROP POLICY IF EXISTS "select_own_budget" ON budgets;
DROP POLICY IF EXISTS "insert_own_data" ON budgets;
DROP POLICY IF EXISTS "update_own_data" ON budgets;
DROP POLICY IF EXISTS "delete_own_data" ON budgets;

-- Create new policy for budgets
CREATE POLICY "public_access_budgets"
  ON budgets
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Drop all existing policies for incomes
DROP POLICY IF EXISTS "Users can read own incomes" ON incomes;
DROP POLICY IF EXISTS "Users can insert own incomes" ON incomes;
DROP POLICY IF EXISTS "Users can update own incomes" ON incomes;
DROP POLICY IF EXISTS "Users can delete own incomes" ON incomes;
DROP POLICY IF EXISTS "select_own_data" ON incomes;
DROP POLICY IF EXISTS "insert_own_data" ON incomes;
DROP POLICY IF EXISTS "update_own_data" ON incomes;
DROP POLICY IF EXISTS "delete_own_data" ON incomes;

-- Create new policy for incomes
CREATE POLICY "public_access_incomes"
  ON incomes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Update user_id columns to be nullable since we're not using auth.users anymore
ALTER TABLE transactions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE goals ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE budgets ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE incomes ALTER COLUMN user_id DROP NOT NULL;

-- Remove foreign key constraints that reference auth.users
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_user_id_fkey;
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_user_id_fkey;
ALTER TABLE incomes DROP CONSTRAINT IF EXISTS incomes_user_id_fkey;