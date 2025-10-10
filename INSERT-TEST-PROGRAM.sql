-- =====================================================
-- Quick Test: Insert just 2 programs to test the UI
-- =====================================================

-- Get your user ID first
SELECT id, email FROM profiles LIMIT 1;

-- Then insert 2 test programs (replace YOUR_USER_ID with the id from above)
INSERT INTO workout_programs (
  user_id,
  name,
  description,
  duration_weeks,
  is_active,
  is_public,
  is_featured,
  difficulty,
  goal,
  workouts_per_week,
  like_count,
  use_count
) VALUES
  -- Test Program 1
  (
    'YOUR_USER_ID',
    'Test: 8-Week Beginner Program',
    'This is a test program to verify the UI works correctly.',
    8,
    true,
    true,
    true,
    'beginner',
    'strength',
    3,
    50,
    25
  ),
  -- Test Program 2
  (
    'YOUR_USER_ID',
    'Test: 6-Week Fat Loss',
    'Another test program for the Training Programs hub.',
    6,
    true,
    true,
    false,
    'intermediate',
    'fat-loss',
    4,
    30,
    15
  );

-- Verify
SELECT COUNT(*) FROM workout_programs;
SELECT name, is_public, is_featured, difficulty FROM workout_programs;