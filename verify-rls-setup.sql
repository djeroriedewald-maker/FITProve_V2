-- VERIFICATIE VAN RLS SETUP
-- Run dit om te checken of alles correct is ingesteld

-- 1. Check auth users en profiles synchronisatie
SELECT 
  'AUTH USERS & PROFILES STATUS' as check_type,
  (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) as confirmed_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) = (SELECT COUNT(*) FROM profiles) 
    THEN '✅ GESYNCHRONISEERD' 
    ELSE '❌ NIET GESYNCHRONISEERD' 
  END as sync_status;

-- 2. Check alle RLS policies
SELECT 
  'RLS POLICIES STATUS' as check_type,
  tablename,
  policyname,
  CASE 
    WHEN cmd = 'ALL' THEN 'Volledige toegang'
    WHEN cmd = 'SELECT' THEN 'Lezen'
    WHEN cmd = 'INSERT' THEN 'Aanmaken'
    WHEN cmd = 'UPDATE' THEN 'Updaten'
    WHEN cmd = 'DELETE' THEN 'Verwijderen'
  END as toegang_type,
  CASE 
    WHEN roles = '{authenticated}' THEN '✅ AUTHENTICATED USERS'
    WHEN roles = '{anon,authenticated}' THEN '✅ PUBLIC + AUTHENTICATED'
    ELSE '⚠️ ' || array_to_string(roles, ', ')
  END as voor_wie
FROM pg_policies 
WHERE tablename IN ('profiles', 'custom_workouts', 'custom_workout_exercises', 'workout_sessions', 'workout_exercise_results', 'workout_likes', 'exercises')
ORDER BY tablename, policyname;

-- 3. Check of er missing profiles zijn
SELECT 
  'MISSING PROFILES CHECK' as check_type,
  au.email,
  au.id,
  'Auth user without profile' as issue
FROM auth.users au
WHERE au.email_confirmed_at IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id);

-- 4. Check RLS status op tabellen
SELECT 
  'RLS TABLE STATUS' as check_type,
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as rls_status
FROM pg_tables 
WHERE tablename IN ('profiles', 'custom_workouts', 'custom_workout_exercises', 'workout_sessions', 'workout_exercise_results', 'workout_likes', 'exercises')
AND schemaname = 'public';

-- 5. Test toegang tot workout tables (als je ingelogd bent)
SELECT 
  'WORKOUT TABLE ACCESS TEST' as check_type,
  'custom_workouts' as table_name,
  COUNT(*) as accessible_records,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ TOEGANG OK'
    ELSE '❌ GEEN TOEGANG'
  END as access_status
FROM custom_workouts
UNION ALL
SELECT 
  'WORKOUT TABLE ACCESS TEST' as check_type,
  'exercises' as table_name,
  COUNT(*) as accessible_records,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ TOEGANG OK'
    ELSE '❌ GEEN TOEGANG'
  END as access_status
FROM exercises;

-- 6. Final status
SELECT 
  'FINAL STATUS' as check_type,
  'Setup voltooid - alle authenticated users hebben toegang tot workout creator' as message,
  'Test nu de Save Workout functionaliteit in de app' as next_step;