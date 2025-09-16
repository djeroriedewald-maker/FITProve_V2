-- TEMPORARY: Disable RLS for workout tables to test profile-based authentication
-- This allows the app to work with profile authentication instead of Supabase auth
-- Run this in Supabase SQL Editor for DEVELOPMENT/TESTING ONLY

-- Option 1: Temporarily disable RLS (Development only)
ALTER TABLE custom_workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE custom_workout_exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercise_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_likes DISABLE ROW LEVEL SECURITY;

-- OR Option 2: Create more permissive policies that allow operations based on user_id match
-- (if you prefer to keep RLS enabled but make it work with profile system)

-- First, let's check if there are any existing workouts
SELECT COUNT(*) as workout_count FROM custom_workouts;
SELECT COUNT(*) as profile_count FROM profiles;

-- Verification message
SELECT 'RLS disabled for workout tables - profile authentication should now work' as status;