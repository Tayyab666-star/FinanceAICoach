/*
  # Complete Authentication System Setup

  1. Update user_profiles table structure
    - Ensure proper foreign key relationship with auth.users
    - Add proper constraints and indexes
  
  2. Update RLS policies to work with Supabase Auth
    - Use auth.uid() for proper user identification
    - Ensure data isolation between users
  
  3. Create proper storage policies for receipts
    - Allow authenticated users to manage their own files
*/

-- First, ensure the user_profiles table has the correct structure
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure email column exists and is properly constrained
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email text;
  END IF;
END $$;

-- Make email unique and not null
ALTER TABLE user_profiles ALTER COLUMN email SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_email_key ON user_profiles(email);

-- Update all table foreign keys to reference auth.users properly
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE transactions ADD CONSTRAINT transactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_user_id_fkey;
ALTER TABLE goals ADD CONSTRAINT goals_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_user_id_fkey;
ALTER TABLE budgets ADD CONSTRAINT budgets_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE incomes DROP CONSTRAINT IF EXISTS incomes_user_id_fkey;
ALTER TABLE incomes ADD CONSTRAINT incomes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make user_id columns NOT NULL again since we have proper auth
ALTER TABLE transactions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE goals ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE budgets ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE incomes ALTER COLUMN user_id SET NOT NULL;

-- Drop all existing policies
DROP POLICY IF EXISTS "public_access_user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "public_access_transactions" ON transactions;
DROP POLICY IF EXISTS "public_access_goals" ON goals;
DROP POLICY IF EXISTS "public_access_budgets" ON budgets;
DROP POLICY IF EXISTS "public_access_incomes" ON incomes;

-- Create proper RLS policies using auth.uid()
-- User profiles policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Transactions policies
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can read own goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can read own budgets"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON budgets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Incomes policies
CREATE POLICY "Users can read own incomes"
  ON incomes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own incomes"
  ON incomes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incomes"
  ON incomes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own incomes"
  ON incomes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Receipts policies (update existing ones)
DROP POLICY IF EXISTS "Public access to receipts" ON receipts;

CREATE POLICY "Users can read own receipts"
  ON receipts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts"
  ON receipts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own receipts"
  ON receipts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own receipts"
  ON receipts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update storage policies for receipts
DROP POLICY IF EXISTS "Allow public uploads to receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from receipts" ON storage.objects;

-- Create proper storage policies
CREATE POLICY "Users can upload their own receipts"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'receipts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own receipts"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'receipts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own receipts"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'receipts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Ensure storage bucket is properly configured
UPDATE storage.buckets 
SET 
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'receipts';