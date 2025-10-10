-- ============================================================================
-- FIX RLS POLICIES (SAFE VERSION - Handles existing policies)
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================

-- ============================================================================
-- FIX 1: Drop and recreate user_periodization policies (fix 406 errors)
-- ============================================================================

DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own periodization" ON public.user_periodization;
  DROP POLICY IF EXISTS "Users can insert their own periodization" ON public.user_periodization;
  DROP POLICY IF EXISTS "Users can update their own periodization" ON public.user_periodization;
  DROP POLICY IF EXISTS "Users can delete their own periodization" ON public.user_periodization;
  DROP POLICY IF EXISTS "Enable read access for users to their own periodization" ON public.user_periodization;
  DROP POLICY IF EXISTS "Enable insert access for users to their own periodization" ON public.user_periodization;
  DROP POLICY IF EXISTS "Enable update access for users to their own periodization" ON public.user_periodization;
  DROP POLICY IF EXISTS "Enable delete access for users to their own periodization" ON public.user_periodization;
END $$;

-- Create new policies that work correctly
CREATE POLICY "Enable read access for users to their own periodization"
  ON public.user_periodization FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Enable insert access for users to their own periodization"
  ON public.user_periodization FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable update access for users to their own periodization"
  ON public.user_periodization FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable delete access for users to their own periodization"
  ON public.user_periodization FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- FIX 2: Create avatars storage bucket (if not exists)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- ============================================================================
-- FIX 3: Drop ALL existing storage policies first
-- ============================================================================

DO $$
BEGIN
  -- Drop all possible variations of storage policies
  DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete avatar" ON storage.objects;
END $$;

-- ============================================================================
-- FIX 4: Create fresh storage policies
-- ============================================================================

-- Allow public access to view avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars to their own folder
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- SUCCESS! All policies fixed.
-- ============================================================================
