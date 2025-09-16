-- Migration: Workout Creator Schema (Safe Version)
-- Description: Add tables for custom workout creation, sharing, and execution
-- Date: 2025-09-16
-- Note: This version safely handles existing policies and tables

-- Create custom_workouts table for user-created workout templates
CREATE TABLE IF NOT EXISTS public.custom_workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  description TEXT DEFAULT '',
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  
  -- Workout metadata
  estimated_duration INTEGER CHECK (estimated_duration > 0), -- minutes
  estimated_calories INTEGER CHECK (estimated_calories > 0),
  total_exercises INTEGER DEFAULT 0 CHECK (total_exercises >= 0),
  
  -- Categorization and discovery
  tags TEXT[] DEFAULT '{}',
  primary_muscle_groups TEXT[] DEFAULT '{}',
  equipment_needed TEXT[] DEFAULT '{}',
  
  -- Visual and social features
  hero_image_url TEXT DEFAULT NULL,
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  like_count INTEGER DEFAULT 0 CHECK (like_count >= 0),
  use_count INTEGER DEFAULT 0 CHECK (use_count >= 0),
  share_count INTEGER DEFAULT 0 CHECK (share_count >= 0),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create custom_workout_exercises table for exercises within custom workouts
CREATE TABLE IF NOT EXISTS public.custom_workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  custom_workout_id UUID REFERENCES public.custom_workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  
  -- Exercise order and grouping
  order_index INTEGER NOT NULL CHECK (order_index >= 0),
  superset_group INTEGER DEFAULT NULL, -- NULL for individual exercises, number for grouped exercises
  
  -- Set configuration
  sets INTEGER DEFAULT 3 CHECK (sets > 0),
  reps TEXT DEFAULT '8-12', -- flexible format: "8-12", "AMRAP", "30 seconds", "to failure"
  weight_suggestion NUMERIC(5,2) CHECK (weight_suggestion >= 0), -- suggested starting weight
  rest_seconds INTEGER DEFAULT 60 CHECK (rest_seconds >= 0),
  
  -- Additional configuration
  notes TEXT DEFAULT '',
  is_warmup BOOLEAN DEFAULT false,
  is_cooldown BOOLEAN DEFAULT false,
  
  -- Ensure unique ordering within workout
  UNIQUE(custom_workout_id, order_index)
);

-- Create workout_sessions table for tracking actual workout executions
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  custom_workout_id UUID REFERENCES public.custom_workouts(id) ON DELETE SET NULL, -- Allow null for manual sessions
  
  -- Session identification
  workout_name TEXT NOT NULL, -- Snapshot of workout name at time of execution
  workout_type TEXT DEFAULT 'custom', -- 'custom', 'template', 'manual'
  
  -- Session timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  paused_duration INTEGER DEFAULT 0 CHECK (paused_duration >= 0), -- total pause time in seconds
  
  -- Session status
  status TEXT CHECK (status IN ('in_progress', 'completed', 'cancelled', 'paused')) DEFAULT 'in_progress',
  
  -- Performance metrics
  total_duration INTEGER CHECK (total_duration >= 0), -- actual duration in minutes
  calories_burned INTEGER CHECK (calories_burned >= 0),
  exercises_completed INTEGER DEFAULT 0 CHECK (exercises_completed >= 0),
  total_sets INTEGER DEFAULT 0 CHECK (total_sets >= 0),
  total_reps INTEGER DEFAULT 0 CHECK (total_reps >= 0),
  total_weight_lifted NUMERIC(10,2) DEFAULT 0 CHECK (total_weight_lifted >= 0),
  
  -- Subjective metrics
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10), -- pre-workout energy
  fatigue_level INTEGER CHECK (fatigue_level BETWEEN 1 AND 10), -- post-workout fatigue
  
  -- Session notes
  notes TEXT DEFAULT '',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create workout_exercise_results table for detailed per-exercise performance
CREATE TABLE IF NOT EXISTS public.workout_exercise_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  custom_workout_exercise_id UUID REFERENCES public.custom_workout_exercises(id) ON DELETE SET NULL,
  
  -- Exercise identification
  exercise_name TEXT NOT NULL, -- Snapshot at time of execution
  order_index INTEGER NOT NULL CHECK (order_index >= 0),
  
  -- Set-by-set results (JSON array of set objects)
  set_results JSONB DEFAULT '[]'::jsonb, 
  -- Example: [{"set": 1, "reps": 10, "weight": 135, "rpe": 7, "rest_seconds": 60, "notes": "felt strong"}]
  
  -- Exercise summary
  total_sets INTEGER DEFAULT 0 CHECK (total_sets >= 0),
  total_reps INTEGER DEFAULT 0 CHECK (total_reps >= 0),
  total_weight NUMERIC(10,2) DEFAULT 0 CHECK (total_weight >= 0),
  max_weight NUMERIC(10,2) DEFAULT 0 CHECK (max_weight >= 0),
  average_rpe NUMERIC(3,1) CHECK (average_rpe BETWEEN 1 AND 10),
  
  -- Timing
  exercise_duration INTEGER CHECK (exercise_duration >= 0), -- seconds spent on this exercise
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Exercise-specific notes
  notes TEXT DEFAULT '',
  
  UNIQUE(workout_session_id, order_index)
);

-- Create workout_likes table for social features
CREATE TABLE IF NOT EXISTS public.workout_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  custom_workout_id UUID REFERENCES public.custom_workouts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(user_id, custom_workout_id)
);

-- Create indexes for performance (safe, using IF NOT EXISTS equivalent)
DO $$
BEGIN
  -- Custom workouts indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_custom_workouts_user_id') THEN
    CREATE INDEX idx_custom_workouts_user_id ON public.custom_workouts(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_custom_workouts_public') THEN
    CREATE INDEX idx_custom_workouts_public ON public.custom_workouts(is_public) WHERE is_public = true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_custom_workouts_featured') THEN
    CREATE INDEX idx_custom_workouts_featured ON public.custom_workouts(is_featured) WHERE is_featured = true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_custom_workouts_tags') THEN
    CREATE INDEX idx_custom_workouts_tags ON public.custom_workouts USING GIN(tags);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_custom_workouts_muscle_groups') THEN
    CREATE INDEX idx_custom_workouts_muscle_groups ON public.custom_workouts USING GIN(primary_muscle_groups);
  END IF;

  -- Custom workout exercises indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_custom_workout_exercises_workout') THEN
    CREATE INDEX idx_custom_workout_exercises_workout ON public.custom_workout_exercises(custom_workout_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_custom_workout_exercises_exercise') THEN
    CREATE INDEX idx_custom_workout_exercises_exercise ON public.custom_workout_exercises(exercise_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_custom_workout_exercises_order') THEN
    CREATE INDEX idx_custom_workout_exercises_order ON public.custom_workout_exercises(custom_workout_id, order_index);
  END IF;

  -- Workout sessions indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_sessions_user') THEN
    CREATE INDEX idx_workout_sessions_user ON public.workout_sessions(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_sessions_workout') THEN
    CREATE INDEX idx_workout_sessions_workout ON public.workout_sessions(custom_workout_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_sessions_status') THEN
    CREATE INDEX idx_workout_sessions_status ON public.workout_sessions(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_sessions_completed') THEN
    CREATE INDEX idx_workout_sessions_completed ON public.workout_sessions(completed_at) WHERE completed_at IS NOT NULL;
  END IF;

  -- Workout exercise results indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_exercise_results_session') THEN
    CREATE INDEX idx_workout_exercise_results_session ON public.workout_exercise_results(workout_session_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_exercise_results_exercise') THEN
    CREATE INDEX idx_workout_exercise_results_exercise ON public.workout_exercise_results(exercise_id);
  END IF;

  -- Workout likes indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_likes_user') THEN
    CREATE INDEX idx_workout_likes_user ON public.workout_likes(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_likes_workout') THEN
    CREATE INDEX idx_workout_likes_workout ON public.workout_likes(custom_workout_id);
  END IF;
END $$;

-- Create functions for updating workout statistics
CREATE OR REPLACE FUNCTION update_custom_workout_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update exercise count when exercises are added/removed
  UPDATE public.custom_workouts 
  SET 
    total_exercises = (
      SELECT COUNT(*) 
      FROM public.custom_workout_exercises 
      WHERE custom_workout_id = COALESCE(NEW.custom_workout_id, OLD.custom_workout_id)
    ),
    updated_at = timezone('utc'::text, now())
  WHERE id = COALESCE(NEW.custom_workout_id, OLD.custom_workout_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating workout stats (safe)
DROP TRIGGER IF EXISTS trigger_update_custom_workout_stats ON public.custom_workout_exercises;
CREATE TRIGGER trigger_update_custom_workout_stats
  AFTER INSERT OR DELETE ON public.custom_workout_exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_workout_stats();

-- Create function for updating like counts
CREATE OR REPLACE FUNCTION update_workout_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.custom_workouts 
    SET like_count = like_count + 1
    WHERE id = NEW.custom_workout_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.custom_workouts 
    SET like_count = GREATEST(like_count - 1, 0)
    WHERE id = OLD.custom_workout_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating like counts (safe)
DROP TRIGGER IF EXISTS trigger_update_workout_like_count ON public.workout_likes;
CREATE TRIGGER trigger_update_workout_like_count
  AFTER INSERT OR DELETE ON public.workout_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_workout_like_count();

-- Create function to update use count when workout session is created
CREATE OR REPLACE FUNCTION increment_workout_use_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.custom_workout_id IS NOT NULL THEN
    UPDATE public.custom_workouts 
    SET use_count = use_count + 1
    WHERE id = NEW.custom_workout_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for incrementing use count (safe)
DROP TRIGGER IF EXISTS trigger_increment_workout_use_count ON public.workout_sessions;
CREATE TRIGGER trigger_increment_workout_use_count
  AFTER INSERT ON public.workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION increment_workout_use_count();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables (safe)
ALTER TABLE public.custom_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercise_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DO $$
BEGIN
  -- Drop custom_workouts policies
  DROP POLICY IF EXISTS "Users can view their own custom workouts" ON public.custom_workouts;
  DROP POLICY IF EXISTS "Users can view public custom workouts" ON public.custom_workouts;
  DROP POLICY IF EXISTS "Users can create custom workouts" ON public.custom_workouts;
  DROP POLICY IF EXISTS "Users can update their own custom workouts" ON public.custom_workouts;
  DROP POLICY IF EXISTS "Users can delete their own custom workouts" ON public.custom_workouts;
  
  -- Drop custom_workout_exercises policies
  DROP POLICY IF EXISTS "Users can view exercises from accessible workouts" ON public.custom_workout_exercises;
  DROP POLICY IF EXISTS "Users can manage exercises in their own workouts" ON public.custom_workout_exercises;
  
  -- Drop workout_sessions policies
  DROP POLICY IF EXISTS "Users can view their own workout sessions" ON public.workout_sessions;
  DROP POLICY IF EXISTS "Users can create their own workout sessions" ON public.workout_sessions;
  DROP POLICY IF EXISTS "Users can update their own workout sessions" ON public.workout_sessions;
  DROP POLICY IF EXISTS "Users can delete their own workout sessions" ON public.workout_sessions;
  
  -- Drop workout_exercise_results policies
  DROP POLICY IF EXISTS "Users can view results from their own sessions" ON public.workout_exercise_results;
  DROP POLICY IF EXISTS "Users can manage results for their own sessions" ON public.workout_exercise_results;
  
  -- Drop workout_likes policies
  DROP POLICY IF EXISTS "Users can view all workout likes" ON public.workout_likes;
  DROP POLICY IF EXISTS "Users can like/unlike workouts" ON public.workout_likes;
END $$;

-- Create fresh policies
CREATE POLICY "Users can view their own custom workouts"
  ON public.custom_workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public custom workouts"
  ON public.custom_workouts FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create custom workouts"
  ON public.custom_workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom workouts"
  ON public.custom_workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom workouts"
  ON public.custom_workouts FOR DELETE
  USING (auth.uid() = user_id);

-- Custom workout exercises policies
CREATE POLICY "Users can view exercises from accessible workouts"
  ON public.custom_workout_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.custom_workouts cw 
      WHERE cw.id = custom_workout_id 
      AND (cw.user_id = auth.uid() OR cw.is_public = true)
    )
  );

CREATE POLICY "Users can manage exercises in their own workouts"
  ON public.custom_workout_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.custom_workouts cw 
      WHERE cw.id = custom_workout_id 
      AND cw.user_id = auth.uid()
    )
  );

-- Workout sessions policies
CREATE POLICY "Users can view their own workout sessions"
  ON public.workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout sessions"
  ON public.workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout sessions"
  ON public.workout_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout sessions"
  ON public.workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Workout exercise results policies
CREATE POLICY "Users can view results from their own sessions"
  ON public.workout_exercise_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws 
      WHERE ws.id = workout_session_id 
      AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage results for their own sessions"
  ON public.workout_exercise_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws 
      WHERE ws.id = workout_session_id 
      AND ws.user_id = auth.uid()
    )
  );

-- Workout likes policies
CREATE POLICY "Users can view all workout likes"
  ON public.workout_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like/unlike workouts"
  ON public.workout_likes FOR ALL
  USING (auth.uid() = user_id);

-- Create views for common queries (safe - drop in correct dependency order)
-- Drop dependent views first
DROP VIEW IF EXISTS public.popular_workouts;
DROP VIEW IF EXISTS public.workout_details;

-- Create base view first
CREATE VIEW public.workout_details AS
SELECT 
  cw.*,
  COUNT(cwe.id) as exercise_count,
  COALESCE(AVG(ws.difficulty_rating), 0) as average_difficulty_rating,
  COUNT(DISTINCT ws.id) as session_count,
  u.display_name as creator_name,
  u.username as creator_username
FROM public.custom_workouts cw
LEFT JOIN public.custom_workout_exercises cwe ON cw.id = cwe.custom_workout_id
LEFT JOIN public.workout_sessions ws ON cw.id = ws.custom_workout_id AND ws.status = 'completed'
LEFT JOIN public.profiles u ON cw.user_id = u.id
GROUP BY cw.id, u.display_name, u.username;

-- Create dependent view after base view
CREATE VIEW public.popular_workouts AS
SELECT 
  wd.*
FROM public.workout_details wd
WHERE wd.is_public = true
ORDER BY (wd.like_count * 2 + wd.use_count + wd.session_count) DESC;

-- Grant permissions
GRANT SELECT ON public.workout_details TO anon, authenticated;
GRANT SELECT ON public.popular_workouts TO anon, authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_workouts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_workout_exercises TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_exercise_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_likes TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;