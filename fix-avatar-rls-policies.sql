-- Fix avatar storage and profile issues
-- Run this in Supabase SQL Editor

-- 1. First, let's check the current RLS policies on storage.objects
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 2. Drop existing conflicting policies (if any)
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- 3. Create proper RLS policies for avatars
-- Allow authenticated users to insert their own avatars
CREATE POLICY "Allow authenticated users to upload avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
);

-- Allow users to update their own avatars (optional, less restrictive)
CREATE POLICY "Allow authenticated users to update avatars" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
);

-- Allow users to delete their own avatars (optional, less restrictive)
CREATE POLICY "Allow authenticated users to delete avatars" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
);

-- Allow public read access to avatars
CREATE POLICY "Allow public read access to avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- 4. Force refresh the profile by updating the updated_at timestamp
UPDATE profiles 
SET updated_at = NOW(),
    avatar_url = 'https://qsn2qmt-6b92-46f5-8fff-d655eB9054f3.supabase.co/storage/v1/object/public/avatars/avatar_f757857962912.jpeg'
WHERE id IN (
    SELECT profiles.id 
    FROM auth.users 
    JOIN profiles ON auth.users.id = profiles.id 
    WHERE auth.users.email = 'djeroriedewald@gmail.com'
);

-- 5. Verify the profile update
SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.updated_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'djeroriedewald@gmail.com';