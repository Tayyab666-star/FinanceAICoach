/*
  # Add Demo Account with Sample Transactions

  1. Create a demo user account
  2. Add sample transactions for demonstration
  3. Set up basic budget and profile for the demo user
  
  Note: This creates a demo account that users can log into to see the app in action
*/

-- Insert demo user profile (using a fixed UUID for consistency)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'demo@financeapp.com',
  '$2a$10$rgl8KqwgH.6jI/3StZy1/.Zx9uGJ7fCg8LWNkMDQKZvqQQvpnKWYu', -- password: demo123
  now(),
  now(),
  now(),
  '{"name": "Demo User"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert user profile for demo account
INSERT INTO user_profiles (
  id,
  monthly_income,
  monthly_budget,
  setup_completed,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  6500.00,
  5200.00,
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  monthly_income = EXCLUDED.monthly_income,
  monthly_budget = EXCLUDED.monthly_budget,
  setup_completed = EXCLUDED.setup_completed,
  updated_at = now();

-- Insert sample budget categories for demo user
INSERT INTO budgets (
  user_id,
  category,
  allocated_amount,
  created_at,
  updated_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Food', 1200.00, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'Transport', 800.00, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'Entertainment', 400.00, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'Shopping', 600.00, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'Bills', 1500.00, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'Healthcare', 300.00, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'Education', 200.00, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'Other', 200.00, now(), now())
ON CONFLICT (user_id, category) DO UPDATE SET
  allocated_amount = EXCLUDED.allocated_amount,
  updated_at = now();

-- Insert sample transactions for demo user
INSERT INTO transactions (
  user_id,
  type,
  category,
  amount,
  date,
  description,
  created_at
) VALUES 
  -- Income transactions
  ('550e8400-e29b-41d4-a716-446655440000', 'income', 'Other', 6500.00, CURRENT_DATE - INTERVAL '1 day', 'Monthly Salary', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'income', 'Other', 500.00, CURRENT_DATE - INTERVAL '5 days', 'Freelance Project', now()),
  
  -- Expense transactions
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Food', 45.67, CURRENT_DATE, 'Grocery Shopping - Walmart', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Transport', 35.20, CURRENT_DATE, 'Gas Station Fill-up', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Food', 12.50, CURRENT_DATE - INTERVAL '1 day', 'Coffee Shop', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Entertainment', 25.00, CURRENT_DATE - INTERVAL '1 day', 'Movie Tickets', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Shopping', 89.99, CURRENT_DATE - INTERVAL '2 days', 'Amazon Purchase', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Bills', 120.00, CURRENT_DATE - INTERVAL '3 days', 'Electric Bill', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Food', 67.80, CURRENT_DATE - INTERVAL '3 days', 'Restaurant Dinner', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Transport', 15.00, CURRENT_DATE - INTERVAL '4 days', 'Uber Ride', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Healthcare', 45.00, CURRENT_DATE - INTERVAL '5 days', 'Pharmacy', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Food', 23.45, CURRENT_DATE - INTERVAL '6 days', 'Lunch - Subway', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Bills', 85.00, CURRENT_DATE - INTERVAL '7 days', 'Internet Bill', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Entertainment', 18.99, CURRENT_DATE - INTERVAL '8 days', 'Netflix Subscription', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Shopping', 156.78, CURRENT_DATE - INTERVAL '9 days', 'Clothing Store', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Food', 78.90, CURRENT_DATE - INTERVAL '10 days', 'Grocery Shopping - Target', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Transport', 42.30, CURRENT_DATE - INTERVAL '11 days', 'Gas Station', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Education', 99.00, CURRENT_DATE - INTERVAL '12 days', 'Online Course', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Healthcare', 150.00, CURRENT_DATE - INTERVAL '13 days', 'Doctor Visit', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Food', 34.56, CURRENT_DATE - INTERVAL '14 days', 'Fast Food', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Entertainment', 75.00, CURRENT_DATE - INTERVAL '15 days', 'Concert Tickets', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Bills', 95.00, CURRENT_DATE - INTERVAL '16 days', 'Phone Bill', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Shopping', 45.67, CURRENT_DATE - INTERVAL '17 days', 'Home Supplies', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Food', 56.78, CURRENT_DATE - INTERVAL '18 days', 'Grocery Shopping', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Transport', 28.50, CURRENT_DATE - INTERVAL '19 days', 'Public Transport', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'expense', 'Other', 125.00, CURRENT_DATE - INTERVAL '20 days', 'Bank Fees', now());

-- Insert sample financial goals for demo user
INSERT INTO goals (
  user_id,
  title,
  target_amount,
  current_amount,
  deadline,
  category,
  created_at,
  updated_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Emergency Fund', 10000.00, 6500.00, CURRENT_DATE + INTERVAL '6 months', 'Savings', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'Vacation to Europe', 5000.00, 2200.00, CURRENT_DATE + INTERVAL '8 months', 'Travel', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'New Laptop', 2500.00, 800.00, CURRENT_DATE + INTERVAL '3 months', 'Purchase', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'Investment Portfolio', 15000.00, 4500.00, CURRENT_DATE + INTERVAL '12 months', 'Investment', now(), now())
ON CONFLICT DO NOTHING;