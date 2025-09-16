-- COMPREHENSIVE FIX: Disable RLS and create test profile
-- Run this entire script in Supabase SQL Editor

-- 1. Disable RLS on ALL relevant tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE custom_workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE custom_workout_exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercise_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_likes DISABLE ROW LEVEL SECURITY;

-- 2. Create a test profile that matches what your app expects
INSERT INTO profiles (
  id,
  email,
  name,
  display_name,
  username,
  bio,
  level,
  created_at,
  updated_at
) VALUES (
  'a0e8400e-29b0-41d4-a716-446655440000',
  'test@fitprove.com',
  'Test User',
  'Test User',
  'testuser',
  'Test user for workout creation',
  1,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = now();

-- 3. Verify the profile was created
SELECT 'Profile created successfully' as status, id, email, name 
FROM profiles 
WHERE id = 'a0e8400e-29b0-41d4-a716-446655440000';

-- 4. Test workout creation
INSERT INTO custom_workouts (
  id,
  user_id,
  name,
  description,
  is_public,
  difficulty,
  tags,
  estimated_duration,
  estimated_calories,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'a0e8400e-29b0-41d4-a716-446655440000',
  'Test RLS Fix Workout',
  'Testing if RLS is properly disabled',
  false,
  'beginner',
  ARRAY['test'],
  30,
  200,
  now(),
  now()
);

-- 5. Verify workout creation
SELECT 'Workout created successfully' as status, id, name, user_id 
FROM custom_workouts 
WHERE name = 'Test RLS Fix Workout';

-- 6. Clean up test workout
DELETE FROM custom_workouts WHERE name = 'Test RLS Fix Workout';

-- 7. Final status check
SELECT 
  'Setup complete - RLS disabled and test profile created' as final_status,
  (SELECT COUNT(*) FROM profiles) as profile_count,
  (SELECT COUNT(*) FROM custom_workouts) as workout_count;