-- Create avatars storage bucket and set up RLS policies
-- This should be run as a database migration or by an admin

-- First, ensure we have the avatars bucket (this might need to be done via Supabase dashboard)
-- CREATE BUCKET IF NOT EXISTS avatars WITH (public = true);

-- Set up RLS policies for avatars storage
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]::text
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]::text
) WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]::text
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]::text
);

-- Allow public access to view avatars (since they should be public)
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');