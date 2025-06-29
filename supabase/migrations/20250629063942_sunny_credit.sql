/*
  # Fix Receipt Upload RLS Policies

  1. Storage Bucket Policies
    - Create proper RLS policies for the receipts storage bucket
    - Allow authenticated users to upload files to their own folders
    - Allow authenticated users to read their own files

  2. Table Policies Review
    - Ensure receipts table policies work correctly with auth.uid()
    - Fix any issues with user authentication in policies
*/

-- First, ensure the receipts storage bucket exists and has RLS enabled
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Enable RLS on the storage bucket
UPDATE storage.buckets SET public = false WHERE id = 'receipts';

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON storage.objects;

-- Create storage policies for receipts bucket
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

-- Update receipts table policies to use proper auth.uid() function
DROP POLICY IF EXISTS "Users can view own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can insert own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can update own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can delete own receipts" ON receipts;

-- Create proper receipts table policies
CREATE POLICY "Users can view own receipts"
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