-- Fix Storage RLS Policies for workout-images bucket
-- This will allow authenticated users to upload program images

-- First, check if the bucket exists and has RLS enabled
-- If RLS is enabled, we need proper policies

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload program images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload workout images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view workout images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Create comprehensive policies for workout-images bucket

-- 1. Allow authenticated users to INSERT (upload) images
CREATE POLICY "Users can upload workout images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'workout-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Allow public SELECT (view/download) for all images in workout-images bucket
CREATE POLICY "Public can view workout images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'workout-images');

-- 3. Allow users to UPDATE their own images
CREATE POLICY "Users can update own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'workout-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'workout-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Allow users to DELETE their own images
CREATE POLICY "Users can delete own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'workout-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify the policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;