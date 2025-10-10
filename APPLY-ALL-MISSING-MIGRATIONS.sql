-- ============================================================================
-- APPLY ALL MISSING MIGRATIONS TO PRODUCTION SUPABASE
-- Run this entire script in Supabase Dashboard > SQL Editor
-- ============================================================================

-- ============================================================================
-- MIGRATION 0014: Add Fitness Profile Fields to profiles table
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age >= 13 AND age <= 120),
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS event_type TEXT,
  ADD COLUMN IF NOT EXISTS limitations TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS available_equipment TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_duration INTEGER CHECK (preferred_duration > 0 AND preferred_duration <= 300),
  ADD COLUMN IF NOT EXISTS preferred_workout_styles TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_muscles TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS frequency_days TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_time TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_workout_generated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_workouts_generated INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_follow BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_direct_messages BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_fitness_level ON public.profiles(fitness_level);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed);

-- ============================================================================
-- MIGRATION 0015: Create user_periodization table
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_periodization table
CREATE TABLE IF NOT EXISTS public.user_periodization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal TEXT NOT NULL CHECK (goal IN ('strength', 'muscle', 'endurance', 'weight-loss', 'event', 'wellness')),

  -- Week tracking
  current_week INTEGER NOT NULL DEFAULT 1 CHECK (current_week > 0),
  total_weeks_completed INTEGER NOT NULL DEFAULT 0,

  -- Phase tracking
  macro_phase TEXT NOT NULL DEFAULT 'base' CHECK (macro_phase IN ('base', 'build', 'peak', 'recovery')),
  micro_week TEXT NOT NULL DEFAULT 'week1' CHECK (micro_week IN ('week1', 'week2', 'week3', 'deload')),

  -- Deload tracking
  is_deload_week BOOLEAN NOT NULL DEFAULT false,
  weeks_since_last_deload INTEGER NOT NULL DEFAULT 0,
  next_deload_week INTEGER NOT NULL DEFAULT 4,

  -- Multipliers
  current_volume_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (current_volume_multiplier BETWEEN 0.5 AND 1.5),
  current_intensity_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (current_intensity_multiplier BETWEEN 0.5 AND 1.5),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one periodization per user per goal
  UNIQUE(user_id, goal)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_periodization_user_id ON public.user_periodization(user_id);
CREATE INDEX IF NOT EXISTS idx_user_periodization_goal ON public.user_periodization(goal);
CREATE INDEX IF NOT EXISTS idx_user_periodization_phase ON public.user_periodization(macro_phase);

-- Enable RLS
ALTER TABLE public.user_periodization ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own periodization"
  ON public.user_periodization FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own periodization"
  ON public.user_periodization FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own periodization"
  ON public.user_periodization FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own periodization"
  ON public.user_periodization FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_periodization_updated_at
  BEFORE UPDATE ON public.user_periodization
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION 0016: Add workout_style column to workout_sessions
-- ============================================================================

ALTER TABLE public.workout_sessions
  ADD COLUMN IF NOT EXISTS workout_style TEXT DEFAULT 'traditional';

-- Add comment
COMMENT ON COLUMN public.workout_sessions.workout_style IS 'Workout style type: traditional, emom, amrap, circuit, superset, etc.';

-- Create index for filtering by style
CREATE INDEX IF NOT EXISTS idx_workout_sessions_style
  ON public.workout_sessions(workout_style);

-- ============================================================================
-- VERIFICATION QUERIES (Run these after to confirm everything worked)
-- ============================================================================

-- Check profiles columns
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'profiles' AND column_name IN ('fitness_level', 'age', 'available_equipment');

-- Check user_periodization table exists
-- SELECT COUNT(*) FROM public.user_periodization;

-- Check workout_sessions has workout_style column
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'workout_sessions' AND column_name = 'workout_style';

-- ============================================================================
-- SUCCESS! All migrations applied.
-- ============================================================================
