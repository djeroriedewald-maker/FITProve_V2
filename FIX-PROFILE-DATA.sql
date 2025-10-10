-- Fix Profile Data Script
-- Run this in Supabase SQL Editor to check and fix your profile

-- 1. Check current profile data
SELECT
  id,
  email,
  name,
  display_name,
  username,
  avatar_url,
  fitness_goals,
  created_at
FROM profiles
WHERE id = auth.uid();  -- Your current user

-- 2. If display_name or username is NULL, update it
UPDATE profiles
SET
  display_name = COALESCE(display_name, name, 'Fitness Champion'),
  username = COALESCE(username, 'user_' || substring(id::text, 1, 8)),
  avatar_url = COALESCE(avatar_url, '')
WHERE id = auth.uid()
  AND (display_name IS NULL OR username IS NULL);

-- 3. Verify the fix
SELECT
  id,
  email,
  name,
  display_name,
  username,
  avatar_url
FROM profiles
WHERE id = auth.uid();
