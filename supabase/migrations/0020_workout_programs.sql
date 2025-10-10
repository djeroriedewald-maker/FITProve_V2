-- =====================================================
-- Migration: Workout Programs and Scheduling
-- Description: Allows users to create workout programs and schedule workouts
-- =====================================================

-- Create workout_programs table
CREATE TABLE IF NOT EXISTS workout_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create program_workouts table (links workouts to programs)
CREATE TABLE IF NOT EXISTS program_workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES custom_workouts(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  week_number INTEGER NOT NULL DEFAULT 1 CHECK (week_number > 0),
  order_index INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workout_programs_user_id ON workout_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_program_workouts_program_id ON program_workouts(program_id);
CREATE INDEX IF NOT EXISTS idx_program_workouts_workout_id ON program_workouts(workout_id);
CREATE INDEX IF NOT EXISTS idx_program_workouts_day_week ON program_workouts(day_of_week, week_number);

-- Enable RLS
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_workouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_programs
CREATE POLICY "Users can view their own programs"
  ON workout_programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own programs"
  ON workout_programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own programs"
  ON workout_programs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own programs"
  ON workout_programs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for program_workouts
CREATE POLICY "Users can view program_workouts for their programs"
  ON program_workouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_programs
      WHERE workout_programs.id = program_workouts.program_id
      AND workout_programs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create program_workouts for their programs"
  ON program_workouts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_programs
      WHERE workout_programs.id = program_workouts.program_id
      AND workout_programs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update program_workouts for their programs"
  ON program_workouts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_programs
      WHERE workout_programs.id = program_workouts.program_id
      AND workout_programs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete program_workouts for their programs"
  ON program_workouts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_programs
      WHERE workout_programs.id = program_workouts.program_id
      AND workout_programs.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_workout_programs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER workout_programs_updated_at
  BEFORE UPDATE ON workout_programs
  FOR EACH ROW
  EXECUTE FUNCTION update_workout_programs_updated_at();

-- Add workout_id column to planner_events if it doesn't exist
ALTER TABLE planner_events
ADD COLUMN IF NOT EXISTS workout_id UUID REFERENCES custom_workouts(id) ON DELETE SET NULL;

-- Create index on workout_id
CREATE INDEX IF NOT EXISTS idx_planner_events_workout_id ON planner_events(workout_id);

-- View for programs with workout details
CREATE OR REPLACE VIEW program_workouts_details AS
SELECT
  pw.id,
  pw.program_id,
  pw.workout_id,
  pw.day_of_week,
  pw.week_number,
  pw.order_index,
  pw.notes,
  cw.name as workout_name,
  cw.description as workout_description,
  cw.difficulty,
  cw.estimated_duration,
  cw.estimated_calories,
  cw.total_exercises,
  cw.hero_image_url
FROM program_workouts pw
JOIN custom_workouts cw ON pw.workout_id = cw.id;