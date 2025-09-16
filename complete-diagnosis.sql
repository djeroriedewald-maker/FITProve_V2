-- COMPLETE DIAGNOSE VAN ALLE PROBLEMEN
-- Run dit om ALLE issues te identificeren

-- 1. AUTH USERS VS PROFILES SYNC CHECK
SELECT 
  'AUTH SYNC STATUS' as check_type,
  'Auth Users' as table_name,
  COUNT(*) as count,
  string_agg(email, ', ') as emails
FROM auth.users WHERE email_confirmed_at IS NOT NULL
UNION ALL
SELECT 
  'AUTH SYNC STATUS' as check_type,
  'Profiles' as table_name,
  COUNT(*) as count,
  string_agg(email, ', ') as emails
FROM profiles;

-- 2. EXACTE CUSTOM_WORKOUTS SCHEMA
SELECT 
  'CUSTOM_WORKOUTS SCHEMA' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'custom_workouts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. RLS POLICIES STATUS
SELECT 
  'RLS POLICIES' as check_type,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'custom_workouts'
ORDER BY policyname;

-- 4. CHECK OF TABELLEN BESTAAN
SELECT 
  'TABLE EXISTS CHECK' as check_type,
  table_name,
  CASE WHEN table_name IN ('custom_workouts', 'profiles', 'exercises') 
       THEN '✅ EXISTS' 
       ELSE '❌ MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('custom_workouts', 'custom_workout_exercises', 'profiles', 'exercises', 'workout_sessions')
ORDER BY table_name;

-- 5. AUTH SESSION TEST
SELECT 
  'AUTH TEST' as check_type,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN '✅ AUTHENTICATED: ' || auth.uid()::text
    ELSE '❌ NOT AUTHENTICATED'
  END as auth_status,
  auth.role() as role;

-- 6. MISSING PROFILES DETAIL
SELECT 
  'MISSING PROFILES DETAIL' as check_type,
  au.id,
  au.email,
  au.created_at as auth_created,
  CASE WHEN p.id IS NULL THEN '❌ NO PROFILE' ELSE '✅ HAS PROFILE' END as profile_status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email_confirmed_at IS NOT NULL
ORDER BY au.created_at;