-- =====================================================
-- Migration: Enhance Workout Programs
-- Description: Add additional fields for programs hub
-- =====================================================

-- Add new columns to workout_programs table
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

-- Add comment
COMMENT ON TABLE workout_programs IS 'Multi-week structured workout programs';
COMMENT ON COLUMN workout_programs.is_public IS 'Whether the program is shared publicly';
COMMENT ON COLUMN workout_programs.is_featured IS 'Whether the program is featured by admins';
COMMENT ON COLUMN workout_programs.difficulty IS 'Difficulty level: beginner, intermediate, or advanced';
COMMENT ON COLUMN workout_programs.goal IS 'Primary training goal (e.g., strength, hypertrophy, fat-loss)';
COMMENT ON COLUMN workout_programs.workouts_per_week IS 'Number of workouts per week';
COMMENT ON COLUMN workout_programs.like_count IS 'Number of likes/favorites';
COMMENT ON COLUMN workout_programs.use_count IS 'Number of times program has been used/scheduled';