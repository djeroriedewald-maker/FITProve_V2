-- =====================================================
-- VERIFY: Check if programs were inserted correctly
-- =====================================================

-- Check how many programs exist
SELECT COUNT(*) as total_programs FROM workout_programs;

-- Check public programs
SELECT COUNT(*) as public_programs FROM workout_programs WHERE is_public = true;

-- Check featured programs
SELECT COUNT(*) as featured_programs FROM workout_programs WHERE is_featured = true;

-- View all programs with details
SELECT
  name,
  difficulty,
  goal,
  duration_weeks,
  workouts_per_week,
  is_public,
  is_featured,
  like_count,
  use_count
FROM workout_programs
ORDER BY created_at DESC;

-- Check if columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'workout_programs'
AND column_name IN ('is_public', 'is_featured', 'difficulty', 'goal', 'workouts_per_week')
ORDER BY column_name;

-- If you see 0 programs, the INSERT might have failed
-- Try running just the INSERT part from APPLY-PROGRAMS-HUB-MIGRATIONS.sql again