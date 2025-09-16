-- VERIFIEER WELK PROJECT JE GEBRUIKT
-- Run dit in je Supabase SQL Editor om te controleren of je in het juiste project bent

-- 1. Check auth users (deze moeten er zijn)
SELECT 
  'AUTH USERS CHECK' as check_type,
  COUNT(*) as total_auth_users,
  string_agg(email, ', ') as auth_emails
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL;

-- 2. Check profiles (deze moeten er NIET zijn als sync nog niet is uitgevoerd)
SELECT 
  'PROFILES CHECK' as check_type,
  COUNT(*) as total_profiles,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ PROFILES TABEL IS LEEG - SYNC NEEDED'
    ELSE '✅ PROFILES BESTAAN - SYNC GEDAAN'
  END as status
FROM profiles;

-- 3. Check current project info
SELECT 
  'PROJECT INFO' as check_type,
  current_database() as database_name,
  'Controleer dat dit project kktyvxhwhuejotsqnbhn is' as note;

-- 4. Laat alle auth users zien met details
SELECT 
  'AUTH USERS DETAIL' as check_type,
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL
ORDER BY created_at;