-- =====================================================
-- Direct Insert: Add programs with your user ID
-- =====================================================

-- STEP 1: Find your user ID (copy the result)
SELECT id, email, display_name FROM profiles LIMIT 1;

-- STEP 2: Copy the 'id' from above and replace 'YOUR_USER_ID' below
-- Then run the INSERT statements

-- Example: If your id is: 12345678-1234-1234-1234-123456789abc
-- Replace every 'YOUR_USER_ID' with: '12345678-1234-1234-1234-123456789abc'

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
  -- Program 1
  (
    'YOUR_USER_ID',
    '8-Week Beginner Strength Builder',
    'Perfect for those new to strength training. Build a solid foundation with compound movements and progressive overload.',
    8,
    true,
    true,
    true,
    'beginner',
    'strength',
    3,
    156,
    89
  ),
  -- Program 2
  (
    'YOUR_USER_ID',
    '12-Week Muscle Gain Program',
    'Hypertrophy-focused program designed to maximize muscle growth. Combines volume training with strategic deloads.',
    12,
    true,
    true,
    true,
    'intermediate',
    'hypertrophy',
    4,
    243,
    127
  ),
  -- Program 3
  (
    'YOUR_USER_ID',
    '6-Week Fat Loss Challenge',
    'High-intensity program combining strength and conditioning. Perfect for burning fat while maintaining muscle mass.',
    6,
    true,
    true,
    true,
    'intermediate',
    'fat-loss',
    5,
    198,
    156
  ),
  -- Program 4
  (
    'YOUR_USER_ID',
    '12-Week Powerlifting Prep',
    'Competition-style powerlifting program focusing on squat, bench press, and deadlift. Includes peaking phase.',
    12,
    true,
    true,
    true,
    'advanced',
    'strength',
    4,
    87,
    34
  ),
  -- Program 5
  (
    'YOUR_USER_ID',
    '8-Week Athletic Performance',
    'Sport-specific training focusing on explosive power, speed, and agility. Ideal for athletes.',
    8,
    true,
    true,
    false,
    'advanced',
    'athletic',
    5,
    124,
    67
  ),
  -- Program 6
  (
    'YOUR_USER_ID',
    '10-Week Endurance Builder',
    'Progressive conditioning program to build cardiovascular endurance and stamina. Great for runners and cyclists.',
    10,
    true,
    true,
    false,
    'beginner',
    'endurance',
    4,
    76,
    45
  ),
  -- Program 7
  (
    'YOUR_USER_ID',
    '6-Week Full Body Transformation',
    'Efficient full-body workouts 3x per week. Perfect for busy schedules while delivering real results.',
    6,
    true,
    true,
    true,
    'beginner',
    'hypertrophy',
    3,
    289,
    178
  ),
  -- Program 8
  (
    'YOUR_USER_ID',
    '10-Week Upper/Lower Split',
    'Classic upper/lower split for balanced development. Focuses on progressive overload and muscle symmetry.',
    10,
    true,
    true,
    false,
    'intermediate',
    'hypertrophy',
    4,
    167,
    93
  ),
  -- Program 9
  (
    'YOUR_USER_ID',
    '8-Week Hybrid Strength & Conditioning',
    'Best of both worlds - build strength while improving conditioning. No compromises needed.',
    8,
    true,
    true,
    true,
    'intermediate',
    'athletic',
    5,
    145,
    81
  ),
  -- Program 10
  (
    'YOUR_USER_ID',
    '12-Week Body Recomposition',
    'Simultaneously build muscle and lose fat. Strategic programming with nutrition guidelines included.',
    12,
    true,
    true,
    true,
    'intermediate',
    'fat-loss',
    4,
    312,
    201
  );

-- STEP 3: Verify the insert worked
SELECT COUNT(*) as total FROM workout_programs;

-- STEP 4: View all programs
SELECT name, difficulty, goal, is_public, is_featured FROM workout_programs;