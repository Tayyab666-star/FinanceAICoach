/*
  # Clean Authentication Users and Application Data

  1. Data Cleanup
    - Remove all user data from application tables
    - Clear all users from auth.users table
    - Reset database to clean state
  
  2. Security
    - Temporarily disable RLS for cleanup operations
    - Re-enable RLS after cleanup
    - Maintain proper security policies
*/

-- First, disable RLS temporarily to allow cleanup
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE incomes DISABLE ROW LEVEL SECURITY;
ALTER TABLE receipts DISABLE ROW LEVEL SECURITY;

-- Clear all user data from application tables (in dependency order)
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

-- Ensure all constraints and indexes are properly maintained
REINDEX TABLE user_profiles;
REINDEX TABLE transactions;
REINDEX TABLE goals;
REINDEX TABLE budgets;
REINDEX TABLE incomes;
REINDEX TABLE receipts;