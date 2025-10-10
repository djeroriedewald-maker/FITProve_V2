-- =====================================================
-- Migration: Create Workout Images Storage Bucket
-- Description: Creates storage bucket for workout hero images
-- =====================================================

-- Create the workout-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workout-images',
  'workout-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy: Allow authenticated users to upload images
CREATE POLICY "Users can upload their own workout images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'workout-images' AND
  (storage.foldername(name))[1] = 'hero-images' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Create storage policy: Allow public read access to all workout images
CREATE POLICY "Public read access to workout images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'workout-images');

-- Create storage policy: Allow users to delete their own images
CREATE POLICY "Users can delete their own workout images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'workout-images' AND
  (storage.foldername(name))[1] = 'hero-images' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Create storage policy: Allow users to update their own images
CREATE POLICY "Users can update their own workout images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'workout-images' AND
  (storage.foldername(name))[1] = 'hero-images' AND
  (storage.foldername(name))[2] = auth.uid()::text
);