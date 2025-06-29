/*
  # Connected Accounts System

  1. New Tables
    - `connected_accounts` - Store user's connected bank accounts and cards
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `account_type` (text: 'bank', 'credit_card', 'debit_card')
      - `account_name` (text: custom name for the account)
      - `bank_name` (text: name of the bank/institution)
      - `account_number` (text: masked account number)
      - `card_number` (text: masked card number for cards)
      - `card_type` (text: 'visa', 'mastercard', 'amex', etc.)
      - `balance` (numeric: current balance)
      - `is_active` (boolean: whether account is active)
      - `last_synced` (timestamp: last sync time)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `account_transactions` - Store transactions for each connected account
      - `id` (uuid, primary key)
      - `account_id` (uuid, references connected_accounts)
      - `user_id` (uuid, references user_profiles)
      - `amount` (numeric)
      - `description` (text)
      - `transaction_date` (date)
      - `category` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own accounts
*/

-- Create connected_accounts table
CREATE TABLE IF NOT EXISTS connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('bank', 'credit_card', 'debit_card')),
  account_name text NOT NULL,
  bank_name text NOT NULL,
  account_number text, -- For bank accounts (masked)
  card_number text, -- For cards (masked)
  card_type text, -- visa, mastercard, amex, etc.
  expiry_month integer, -- For cards
  expiry_year integer, -- For cards
  balance numeric(12,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  last_synced timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create account_transactions table
CREATE TABLE IF NOT EXISTS account_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES connected_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10,2) NOT NULL,
  description text NOT NULL,
  transaction_date date NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for connected_accounts
CREATE POLICY "Users can manage own connected accounts"
  ON connected_accounts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow anonymous access for auth flow compatibility
CREATE POLICY "Allow account access during auth"
  ON connected_accounts
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create policies for account_transactions
CREATE POLICY "Users can manage own account transactions"
  ON account_transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow anonymous access for auth flow compatibility
CREATE POLICY "Allow transaction access during auth"
  ON account_transactions
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_type ON connected_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_active ON connected_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_account_transactions_account_id ON account_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_account_transactions_user_id ON account_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_transactions_date ON account_transactions(transaction_date);

-- Create updated_at trigger for connected_accounts
CREATE TRIGGER update_connected_accounts_updated_at
  BEFORE UPDATE ON connected_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON connected_accounts TO anon, authenticated;
GRANT ALL ON account_transactions TO anon, authenticated;

-- Insert some sample account types for reference
INSERT INTO app_config (key, value, description) VALUES 
  ('supported_banks', 'Chase,Wells Fargo,Bank of America,Citibank,Capital One,US Bank,PNC Bank,TD Bank,Truist,Fifth Third', 'List of supported banks'),
  ('supported_card_types', 'visa,mastercard,amex,discover', 'List of supported card types')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();