-- Verification script for user_periodization table
-- Run this in your Supabase SQL Editor to check if the table is set up correctly

-- 1. Check if the table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'user_periodization'
) AS table_exists;

-- 2. Check the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_periodization'
ORDER BY ordinal_position;

-- 3. Check RLS policies
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
WHERE schemaname = 'public'
AND tablename = 'user_periodization';

-- 4. Check if RLS is enabled
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'user_periodization';

-- 5. Check if there are any existing records
SELECT COUNT(*) as record_count
FROM public.user_periodization;

-- 6. If the table doesn't exist, this will help you create it
-- Uncomment and run the migration if needed:

/*
-- Run migration 0015_user_periodization.sql
-- Copy and paste the contents of supabase/migrations/0015_user_periodization.sql here
*/
