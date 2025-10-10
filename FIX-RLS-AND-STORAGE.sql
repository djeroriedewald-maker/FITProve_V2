-- ============================================================================
-- FIX RLS POLICIES AND ADD AVATAR STORAGE
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================

-- ============================================================================
-- FIX 1: Drop and recreate user_periodization policies (fix 406 errors)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own periodization" ON public.user_periodization;
DROP POLICY IF EXISTS "Users can insert their own periodization" ON public.user_periodization;
DROP POLICY IF EXISTS "Users can update their own periodization" ON public.user_periodization;
DROP POLICY IF EXISTS "Users can delete their own periodization" ON public.user_periodization;

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
-- FIX 2: Ensure profiles table has proper RLS
-- ============================================================================

-- Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create comprehensive policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (is_public = true);

-- ============================================================================
-- FIX 3: Create avatars storage bucket for profile images
-- ============================================================================

-- Create storage bucket for avatars
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
-- FIX 4: Storage policies for avatar uploads
-- ============================================================================

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

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
-- FIX 5: Ensure workout_sessions has proper RLS
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own workout sessions" ON public.workout_sessions;
DROP POLICY IF EXISTS "Users can create their own workout sessions" ON public.workout_sessions;
DROP POLICY IF EXISTS "Users can update their own workout sessions" ON public.workout_sessions;
DROP POLICY IF EXISTS "Users can delete their own workout sessions" ON public.workout_sessions;

-- Create policies
CREATE POLICY "Users can view their own workout sessions"
  ON public.workout_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own workout sessions"
  ON public.workout_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own workout sessions"
  ON public.workout_sessions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own workout sessions"
  ON public.workout_sessions FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify storage bucket exists
-- SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Verify storage policies
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Verify user_periodization policies
-- SELECT * FROM pg_policies WHERE tablename = 'user_periodization';

-- Verify profiles policies
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- ============================================================================
-- SUCCESS! All RLS policies fixed and avatar storage configured.
-- ============================================================================
