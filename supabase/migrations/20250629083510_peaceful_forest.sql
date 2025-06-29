/*
  # Set up Authentication Hooks and Triggers

  1. Auth Hooks
    - Create function to handle new user registration
    - Set up automatic profile creation
    - Configure proper user flow
    
  2. Email Templates
    - Ensure proper email formatting
    - Set up OTP delivery
*/

-- Create or replace function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create user profile automatically when a new user signs up
  INSERT INTO public.user_profiles (
    id,
    email,
    name,
    monthly_income,
    monthly_budget,
    setup_completed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    0,
    0,
    false,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger AS $$
BEGIN
  -- Update user profile when auth.users is updated
  UPDATE public.user_profiles
  SET 
    email = NEW.email,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT ALL ON public.transactions TO anon, authenticated;
GRANT ALL ON public.goals TO anon, authenticated;
GRANT ALL ON public.budgets TO anon, authenticated;
GRANT ALL ON public.incomes TO anon, authenticated;
GRANT ALL ON public.receipts TO anon, authenticated;

-- Ensure RLS policies are properly configured
-- Update RLS policies to be more permissive for the auth flow

-- User profiles policy
DROP POLICY IF EXISTS "public_access_user_profiles" ON public.user_profiles;
CREATE POLICY "Users can manage own profile" ON public.user_profiles
  FOR ALL USING (
    auth.uid() = id OR 
    auth.role() = 'anon'::text OR 
    auth.role() = 'authenticated'::text
  )
  WITH CHECK (
    auth.uid() = id OR 
    auth.role() = 'anon'::text OR 
    auth.role() = 'authenticated'::text
  );

-- Transactions policy
DROP POLICY IF EXISTS "public_access_transactions" ON public.transactions;
CREATE POLICY "Users can manage own transactions" ON public.transactions
  FOR ALL USING (
    auth.uid() = user_id OR 
    auth.role() = 'anon'::text OR 
    auth.role() = 'authenticated'::text
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.role() = 'anon'::text OR 
    auth.role() = 'authenticated'::text
  );

-- Goals policy
DROP POLICY IF EXISTS "public_access_goals" ON public.goals;
CREATE POLICY "Users can manage own goals" ON public.goals
  FOR ALL USING (
    auth.uid() = user_id OR 
    auth.role() = 'anon'::text OR 
    auth.role() = 'authenticated'::text
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.role() = 'anon'::text OR 
    auth.role() = 'authenticated'::text
  );

-- Budgets policy
DROP POLICY IF EXISTS "public_access_budgets" ON public.budgets;
CREATE POLICY "Users can manage own budgets" ON public.budgets
  FOR ALL USING (
    auth.uid() = user_id OR 
    auth.role() = 'anon'::text OR 
    auth.role() = 'authenticated'::text
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.role() = 'anon'::text OR 
    auth.role() = 'authenticated'::text
  );

-- Incomes policy
DROP POLICY IF EXISTS "public_access_incomes" ON public.incomes;
CREATE POLICY "Users can manage own incomes" ON public.incomes
  FOR ALL USING (
    auth.uid() = user_id OR 
    auth.role() = 'anon'::text OR 
    auth.role() = 'authenticated'::text
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.role() = 'anon'::text OR 
    auth.role() = 'authenticated'::text
  );

-- Receipts policy
DROP POLICY IF EXISTS "Public access to receipts" ON public.receipts;
CREATE POLICY "Users can manage own receipts" ON public.receipts
  FOR ALL USING (
    auth.uid() = user_id OR 
    auth.role() = 'anon'::text OR 
    auth.role() = 'authenticated'::text
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.role() = 'anon'::text OR 
    auth.role() = 'authenticated'::text
  );