/*
  # Create reports table for storing generated reports

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `title` (text, report title)
      - `template_id` (text, template identifier)
      - `date_range` (text, date range used)
      - `format` (text, export format)
      - `file_url` (text, URL to generated file)
      - `file_size` (integer, file size in bytes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `reports` table
    - Add policy for users to manage their own reports
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  template_id text NOT NULL,
  date_range text NOT NULL,
  format text NOT NULL DEFAULT 'pdf',
  file_url text,
  file_size integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reports"
  ON reports
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);