-- Add workout_style column to workout_sessions table
-- This tracks the type of workout style used (EMOM, AMRAP, Circuit, etc.)

ALTER TABLE public.workout_sessions
ADD COLUMN IF NOT EXISTS workout_style TEXT DEFAULT 'traditional';

-- Add comment
COMMENT ON COLUMN public.workout_sessions.workout_style IS 'Workout style type: traditional, emom, amrap, circuit, superset, etc.';

-- Create index for filtering by style
CREATE INDEX IF NOT EXISTS idx_workout_sessions_style
ON public.workout_sessions(workout_style);
