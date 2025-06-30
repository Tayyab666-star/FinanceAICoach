/*
  # Fix contact submissions table and policies

  1. Changes
    - Drop existing policy if it exists before creating
    - Use IF NOT EXISTS for all objects
    - Ensure all SQL statements are idempotent
*/

-- Check if table exists first
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_submissions') THEN
    -- Create the table if it doesn't exist
    CREATE TABLE public.contact_submissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      email text NOT NULL,
      subject text NOT NULL,
      message text NOT NULL,
      status text DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Users can read own submissions" ON public.contact_submissions;

-- Create policies
CREATE POLICY "Allow anonymous contact submissions"
  ON public.contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can read own submissions"
  ON public.contact_submissions
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Create function if it doesn't exist
CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON public.contact_submissions;

-- Create trigger
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_submissions_updated_at();

-- Create indices if they don't exist
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at 
  ON public.contact_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status 
  ON public.contact_submissions(status);