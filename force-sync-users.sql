-- FORCE SYNC AUTH USERS MET PROFILES
-- Run dit om de sync problemen op te lossen

-- 1. Laat huidige status zien
SELECT 
  'BEFORE SYNC' as status,
  (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) as auth_users,
  (SELECT COUNT(*) FROM profiles) as profiles;

-- 2. Verwijder eventuele conflicterende profiles (VOORZICHTIG!)
-- DELETE FROM profiles WHERE id NOT IN (SELECT id FROM auth.users);

-- 3. Voeg ontbrekende profiles toe voor alle auth users
INSERT INTO profiles (id, email, name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1), 'User'),
  au.created_at,
  au.updated_at
FROM auth.users au
WHERE au.email_confirmed_at IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = EXCLUDED.updated_at;

-- 4. Laat resultaat zien
SELECT 
  'AFTER SYNC' as status,
  (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) as auth_users,
  (SELECT COUNT(*) FROM profiles) as profiles;

-- 5. Toon alle gesynchroniseerde users
SELECT 
  'SYNCED USERS' as status,
  au.email as auth_email,
  p.email as profile_email,
  p.name as profile_name,
  CASE WHEN au.id = p.id THEN '✅ SYNCED' ELSE '❌ NOT SYNCED' END as sync_status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email_confirmed_at IS NOT NULL
ORDER BY au.email;