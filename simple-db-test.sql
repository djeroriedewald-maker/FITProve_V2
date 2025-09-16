-- SIMPLE DATABASE TEST - NO AUTH REQUIRED
-- Run dit om te testen of de database basics werken

-- 1. Test exercises table (should work - public access)
SELECT 
  'EXERCISES TABLE TEST' as test_type,
  COUNT(*) as exercise_count,
  'Should show exercises if table exists' as note
FROM exercises
LIMIT 5;

-- 2. Show some exercise examples
SELECT 
  'SAMPLE EXERCISES' as test_type,
  id,
  name,
  category
FROM exercises
LIMIT 3;

-- 3. Test custom_workouts structure (might fail due to RLS)
SELECT 
  'CUSTOM_WORKOUTS STRUCTURE' as test_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'custom_workouts'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Count current workouts (might be 0 due to RLS)
SELECT 
  'CURRENT WORKOUTS COUNT' as test_type,
  COUNT(*) as workout_count,
  'Might be 0 due to RLS policies' as note
FROM custom_workouts;