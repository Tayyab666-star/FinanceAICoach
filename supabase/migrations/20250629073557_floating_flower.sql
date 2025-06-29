/*
  # Clean Authentication Users and Reset System

  1. Security & Data Cleanup
    - Remove all existing users from auth.users table
    - Clean up related user_profiles data
    - Reset all user-related tables
    
  2. System Reset
    - Clear all transactions, goals, budgets, incomes, receipts
    - Prepare for fresh test user creation
    
  3. Maintain Table Structure
    - Keep all table schemas intact
    - Preserve RLS policies and constraints
*/

-- First, disable RLS temporarily to allow cleanup
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE incomes DISABLE ROW LEVEL SECURITY;
ALTER TABLE receipts DISABLE ROW LEVEL SECURITY;

-- Clear all user data from application tables
DELETE FROM receipts;
DELETE FROM incomes;
DELETE FROM budgets;
DELETE FROM goals;
DELETE FROM transactions;
DELETE FROM user_profiles;

-- Clear all users from auth.users table (this will cascade to related data)
DELETE FROM auth.users;

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Reset any sequences if needed
SELECT setval(pg_get_serial_sequence('auth.users', 'id'), 1, false);

-- Ensure all tables are ready for new data
VACUUM ANALYZE user_profiles;
VACUUM ANALYZE transactions;
VACUUM ANALYZE goals;
VACUUM ANALYZE budgets;
VACUUM ANALYZE incomes;
VACUUM ANALYZE receipts;
VACUUM ANALYZE auth.users;