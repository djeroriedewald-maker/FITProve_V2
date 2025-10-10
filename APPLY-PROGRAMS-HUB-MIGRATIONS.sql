-- =====================================================
-- COMPLETE MIGRATION: Training Programs Hub
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- PART 1: Enhance workout_programs table with new fields
-- =====================================================

ALTER TABLE workout_programs
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS goal TEXT,
ADD COLUMN IF NOT EXISTS workouts_per_week INTEGER,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS use_count INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workout_programs_is_public ON workout_programs(is_public);
CREATE INDEX IF NOT EXISTS idx_workout_programs_is_featured ON workout_programs(is_featured);
CREATE INDEX IF NOT EXISTS idx_workout_programs_goal ON workout_programs(goal);
CREATE INDEX IF NOT EXISTS idx_workout_programs_difficulty ON workout_programs(difficulty);

-- Add comments
COMMENT ON TABLE workout_programs IS 'Multi-week structured workout programs';
COMMENT ON COLUMN workout_programs.is_public IS 'Whether the program is shared publicly';
COMMENT ON COLUMN workout_programs.is_featured IS 'Whether the program is featured by admins';
COMMENT ON COLUMN workout_programs.difficulty IS 'Difficulty level: beginner, intermediate, or advanced';
COMMENT ON COLUMN workout_programs.goal IS 'Primary training goal (e.g., strength, hypertrophy, fat-loss)';
COMMENT ON COLUMN workout_programs.workouts_per_week IS 'Number of workouts per week';
COMMENT ON COLUMN workout_programs.like_count IS 'Number of likes/favorites';
COMMENT ON COLUMN workout_programs.use_count IS 'Number of times program has been used/scheduled';

-- =====================================================
-- PART 2: Seed with 10 expert programs
-- =====================================================

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
  -- Program 1: Beginner Strength
  (
    (SELECT id FROM profiles LIMIT 1),
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

  -- Program 2: Hypertrophy
  (
    (SELECT id FROM profiles LIMIT 1),
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

  -- Program 3: Fat Loss
  (
    (SELECT id FROM profiles LIMIT 1),
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

  -- Program 4: Powerlifting
  (
    (SELECT id FROM profiles LIMIT 1),
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

  -- Program 5: Athletic Performance
  (
    (SELECT id FROM profiles LIMIT 1),
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

  -- Program 6: Endurance
  (
    (SELECT id FROM profiles LIMIT 1),
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

  -- Program 7: Full Body
  (
    (SELECT id FROM profiles LIMIT 1),
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

  -- Program 8: Upper/Lower Split
  (
    (SELECT id FROM profiles LIMIT 1),
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

  -- Program 9: Strength & Conditioning
  (
    (SELECT id FROM profiles LIMIT 1),
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

  -- Program 10: Body Recomposition
  (
    (SELECT id FROM profiles LIMIT 1),
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
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check that columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'workout_programs'
ORDER BY ordinal_position;

-- Check that programs were inserted
SELECT
  name,
  difficulty,
  goal,
  duration_weeks,
  workouts_per_week,
  is_featured,
  use_count
FROM workout_programs
ORDER BY created_at DESC;

-- Count programs by goal
SELECT goal, COUNT(*) as count
FROM workout_programs
WHERE is_public = true
GROUP BY goal
ORDER BY count DESC;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT
  '✅ Migration Complete!' as status,
  COUNT(*) as total_programs,
  SUM(CASE WHEN is_featured THEN 1 ELSE 0 END) as featured_programs
FROM workout_programs;