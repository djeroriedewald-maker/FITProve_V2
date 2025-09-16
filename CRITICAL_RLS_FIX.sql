-- CRITICAL RLS FIX - RESTRICTIVE POLICIES ONLY
-- Run dit in Supabase SQL Editor om RLS strict te maken

-- 1. CLEANUP: Remove alle oude policies die te permissief zijn
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop alle policies van workout tables
    FOR policy_record IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('custom_workouts', 'custom_workout_exercises', 'workout_sessions', 'workout_exercise_results', 'workout_likes')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, policy_record.tablename);
    END LOOP;
END $$;

-- 2. ENFORCE RLS op alle tables
ALTER TABLE custom_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercise_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_likes ENABLE ROW LEVEL SECURITY;

-- 3. CREATE RESTRICTIVE POLICIES - ALLEEN AUTHENTICATED USERS
CREATE POLICY "authenticated_only_workouts" ON custom_workouts
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_only_workout_exercises" ON custom_workout_exercises
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_only_sessions" ON workout_sessions
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_only_results" ON workout_exercise_results
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_only_likes" ON workout_likes
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 4. PROFILES - stricter policies
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "auth_users_read_profiles" ON profiles
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "auth_users_insert_own_profile" ON profiles
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = id);

CREATE POLICY "auth_users_update_own_profile" ON profiles
FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = id);

-- 5. EXERCISES blijft publiek leesbaar
DROP POLICY IF EXISTS "Public read access to exercises" ON exercises;
CREATE POLICY "public_read_exercises" ON exercises
FOR SELECT USING (true);

-- 6. TEST: Probeer anonymous access (moet falen)
SELECT 'Testing anonymous access...' as status;

-- Deze query zou moeten falen als RLS correct werkt
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    -- Probeer te tellen zonder auth (zou 0 moeten zijn of error)
    SELECT COUNT(*) INTO test_count FROM custom_workouts;
    
    IF test_count > 0 THEN
        RAISE NOTICE 'WARNING: Anonymous access possible - RLS may not be working correctly';
    ELSE
        RAISE NOTICE 'SUCCESS: Anonymous access blocked by RLS';
    END IF;
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'SUCCESS: Anonymous access properly blocked by RLS';
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Unexpected error testing RLS: %', SQLERRM;
END $$;

-- 7. VERIFICATIE: Toon alleen de nieuwe policies
SELECT 
    'RLS_VERIFICATION' as check_type,
    tablename,
    policyname,
    cmd as permission_type
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('custom_workouts', 'custom_workout_exercises', 'workout_sessions', 'workout_exercise_results', 'workout_likes', 'profiles', 'exercises')
ORDER BY tablename, policyname;

SELECT 'RLS CLEANUP AND RESTRICTION COMPLETE' as status;