/*
  # Clean Database and Setup Fresh Start

  1. Delete all existing data from all tables
  2. Reset auto-increment sequences
  3. Ensure proper structure for new user flow
  
  This migration removes all dummy/sample data and prepares for fresh user data
*/

-- Delete all existing data from all tables
DELETE FROM public.transactions;
DELETE FROM public.goals;
DELETE FROM public.budgets;
DELETE FROM public.incomes;
DELETE FROM public.user_profiles;

-- Reset sequences if they exist
DO $$
BEGIN
  -- Reset any sequences that might exist (though we use UUIDs, this is just in case)
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'transactions_id_seq') THEN
    ALTER SEQUENCE transactions_id_seq RESTART WITH 1;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'goals_id_seq') THEN
    ALTER SEQUENCE goals_id_seq RESTART WITH 1;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'budgets_id_seq') THEN
    ALTER SEQUENCE budgets_id_seq RESTART WITH 1;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'incomes_id_seq') THEN
    ALTER SEQUENCE incomes_id_seq RESTART WITH 1;
  END IF;
END $$;

-- Ensure all tables are properly configured for the new flow
-- Make sure user_id columns allow NULL values for flexibility
ALTER TABLE transactions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE goals ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE budgets ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE incomes ALTER COLUMN user_id DROP NOT NULL;

-- Add indexes for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_new ON transactions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_goals_user_id_new ON goals(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_budgets_user_id_new ON budgets(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_incomes_user_id_new ON incomes(user_id) WHERE user_id IS NOT NULL;

-- Ensure email column in user_profiles has proper constraints
ALTER TABLE user_profiles ALTER COLUMN email SET NOT NULL;

-- Add a comment to track this cleanup
COMMENT ON TABLE user_profiles IS 'User profiles table - cleaned and ready for fresh data';
COMMENT ON TABLE transactions IS 'Transactions table - cleaned and ready for fresh data';
COMMENT ON TABLE goals IS 'Goals table - cleaned and ready for fresh data';
COMMENT ON TABLE budgets IS 'Budgets table - cleaned and ready for fresh data';
COMMENT ON TABLE incomes IS 'Incomes table - cleaned and ready for fresh data';