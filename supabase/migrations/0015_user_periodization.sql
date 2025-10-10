-- Migration: Create user_periodization table
-- Tracks long-term periodization state for each user's training goals
-- Enables true progressive programming with macro/micro cycles and deload weeks

CREATE TABLE IF NOT EXISTS public.user_periodization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Training goal (strength, muscle, endurance, weight-loss, event, wellness)
  goal TEXT NOT NULL CHECK (goal IN ('strength', 'muscle', 'endurance', 'weight-loss', 'event', 'wellness')),

  -- Week tracking
  current_week INTEGER NOT NULL DEFAULT 1 CHECK (current_week > 0),
  total_weeks_completed INTEGER NOT NULL DEFAULT 0 CHECK (total_weeks_completed >= 0),
  workouts_this_week INTEGER NOT NULL DEFAULT 0 CHECK (workouts_this_week >= 0),

  -- Macro cycle phase (12-16 weeks)
  macro_phase TEXT NOT NULL CHECK (macro_phase IN ('base', 'build', 'peak', 'recovery')),
  macro_cycle_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Micro cycle week (4 weeks)
  micro_week TEXT NOT NULL CHECK (micro_week IN ('week1', 'week2', 'week3', 'deload')),

  -- Deload tracking
  is_deload_week BOOLEAN NOT NULL DEFAULT false,
  last_deload_week INTEGER,
  weeks_since_last_deload INTEGER NOT NULL DEFAULT 0,
  next_deload_week INTEGER NOT NULL DEFAULT 4,

  -- Volume and intensity multipliers (for current week)
  current_volume_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (current_volume_multiplier >= 0.5 AND current_volume_multiplier <= 1.5),
  current_intensity_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (current_intensity_multiplier >= 0.5 AND current_intensity_multiplier <= 1.5),

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_workout_at TIMESTAMPTZ,

  -- Ensure one periodization record per user per goal
  UNIQUE(user_id, goal)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS user_periodization_user_id_idx ON public.user_periodization(user_id);
CREATE INDEX IF NOT EXISTS user_periodization_user_goal_idx ON public.user_periodization(user_id, goal);
CREATE INDEX IF NOT EXISTS user_periodization_updated_at_idx ON public.user_periodization(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_periodization ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own periodization data
CREATE POLICY read_own_periodization ON public.user_periodization
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own periodization data
CREATE POLICY insert_own_periodization ON public.user_periodization
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own periodization data
CREATE POLICY update_own_periodization ON public.user_periodization
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own periodization data
CREATE POLICY delete_own_periodization ON public.user_periodization
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_periodization_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_periodization_updated_at_trigger
  BEFORE UPDATE ON public.user_periodization
  FOR EACH ROW
  EXECUTE FUNCTION update_user_periodization_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.user_periodization IS 'Tracks long-term periodization state for user training programs';
COMMENT ON COLUMN public.user_periodization.goal IS 'Training goal: strength, muscle, endurance, weight-loss, event, or wellness';
COMMENT ON COLUMN public.user_periodization.current_week IS 'Current week number in the program';
COMMENT ON COLUMN public.user_periodization.total_weeks_completed IS 'Total weeks completed in this program';
COMMENT ON COLUMN public.user_periodization.macro_phase IS 'Current macro cycle phase: base, build, peak, or recovery';
COMMENT ON COLUMN public.user_periodization.micro_week IS 'Current micro cycle week: week1, week2, week3, or deload';
COMMENT ON COLUMN public.user_periodization.is_deload_week IS 'Whether current week is a deload week';
COMMENT ON COLUMN public.user_periodization.current_volume_multiplier IS 'Volume multiplier for current week (0.6 deload to 1.2 peak)';
COMMENT ON COLUMN public.user_periodization.current_intensity_multiplier IS 'Intensity multiplier for current week (0.7 base to 1.1 peak)';
