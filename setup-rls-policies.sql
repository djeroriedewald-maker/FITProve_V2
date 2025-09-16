-- SQL Scripts to run in Supabase SQL Editor
-- These ensure proper Row Level Security (RLS) policies for workout creator functionality

-- 1. Enable RLS on all workout tables (if not already enabled)
ALTER TABLE custom_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercise_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_likes ENABLE ROW LEVEL SECURITY;

-- 2. Custom Workouts Policies
-- Allow users to view all public workouts and their own workouts
DROP POLICY IF EXISTS "Users can view public workouts and own workouts" ON custom_workouts;
CREATE POLICY "Users can view public workouts and own workouts" ON custom_workouts
FOR SELECT USING (
  is_public = true OR 
  auth.uid() = user_id
);

-- Allow authenticated users to insert their own workouts
DROP POLICY IF EXISTS "Users can insert own workouts" ON custom_workouts;
CREATE POLICY "Users can insert own workouts" ON custom_workouts
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own workouts
DROP POLICY IF EXISTS "Users can update own workouts" ON custom_workouts;
CREATE POLICY "Users can update own workouts" ON custom_workouts
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own workouts
DROP POLICY IF EXISTS "Users can delete own workouts" ON custom_workouts;
CREATE POLICY "Users can delete own workouts" ON custom_workouts
FOR DELETE USING (auth.uid() = user_id);

-- 3. Custom Workout Exercises Policies
-- Allow users to view exercises for workouts they can see
DROP POLICY IF EXISTS "Users can view workout exercises" ON custom_workout_exercises;
CREATE POLICY "Users can view workout exercises" ON custom_workout_exercises
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM custom_workouts 
    WHERE custom_workouts.id = custom_workout_exercises.custom_workout_id 
    AND (custom_workouts.is_public = true OR custom_workouts.user_id = auth.uid())
  )
);

-- Allow users to insert exercises for their own workouts
DROP POLICY IF EXISTS "Users can insert workout exercises" ON custom_workout_exercises;
CREATE POLICY "Users can insert workout exercises" ON custom_workout_exercises
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM custom_workouts 
    WHERE custom_workouts.id = custom_workout_exercises.custom_workout_id 
    AND custom_workouts.user_id = auth.uid()
  )
);

-- Allow users to update exercises for their own workouts
DROP POLICY IF EXISTS "Users can update workout exercises" ON custom_workout_exercises;
CREATE POLICY "Users can update workout exercises" ON custom_workout_exercises
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM custom_workouts 
    WHERE custom_workouts.id = custom_workout_exercises.custom_workout_id 
    AND custom_workouts.user_id = auth.uid()
  )
);

-- Allow users to delete exercises for their own workouts
DROP POLICY IF EXISTS "Users can delete workout exercises" ON custom_workout_exercises;
CREATE POLICY "Users can delete workout exercises" ON custom_workout_exercises
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM custom_workouts 
    WHERE custom_workouts.id = custom_workout_exercises.custom_workout_id 
    AND custom_workouts.user_id = auth.uid()
  )
);

-- 4. Workout Sessions Policies (for when users execute workouts)
-- Allow users to view their own workout sessions
DROP POLICY IF EXISTS "Users can view own workout sessions" ON workout_sessions;
CREATE POLICY "Users can view own workout sessions" ON workout_sessions
FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own workout sessions
DROP POLICY IF EXISTS "Users can insert own workout sessions" ON workout_sessions;
CREATE POLICY "Users can insert own workout sessions" ON workout_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own workout sessions
DROP POLICY IF EXISTS "Users can update own workout sessions" ON workout_sessions;
CREATE POLICY "Users can update own workout sessions" ON workout_sessions
FOR UPDATE USING (auth.uid() = user_id);

-- 5. Workout Exercise Results Policies
-- Allow users to view their own exercise results
DROP POLICY IF EXISTS "Users can view own exercise results" ON workout_exercise_results;
CREATE POLICY "Users can view own exercise results" ON workout_exercise_results
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM workout_sessions 
    WHERE workout_sessions.id = workout_exercise_results.workout_session_id 
    AND workout_sessions.user_id = auth.uid()
  )
);

-- Allow users to insert their own exercise results
DROP POLICY IF EXISTS "Users can insert own exercise results" ON workout_exercise_results;
CREATE POLICY "Users can insert own exercise results" ON workout_exercise_results
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM workout_sessions 
    WHERE workout_sessions.id = workout_exercise_results.workout_session_id 
    AND workout_sessions.user_id = auth.uid()
  )
);

-- 6. Workout Likes Policies
-- Allow users to view likes for public workouts
DROP POLICY IF EXISTS "Users can view workout likes" ON workout_likes;
CREATE POLICY "Users can view workout likes" ON workout_likes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM custom_workouts 
    WHERE custom_workouts.id = workout_likes.custom_workout_id 
    AND (custom_workouts.is_public = true OR custom_workouts.user_id = auth.uid())
  )
);

-- Allow authenticated users to like/unlike workouts
DROP POLICY IF EXISTS "Users can manage workout likes" ON workout_likes;
CREATE POLICY "Users can manage workout likes" ON workout_likes
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Exercise Library Access (should be publicly readable)
-- The exercises table should allow public read access
DROP POLICY IF EXISTS "Public read access to exercises" ON exercises;
CREATE POLICY "Public read access to exercises" ON exercises
FOR SELECT USING (true);

-- 8. Create indexes for better performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_custom_workouts_user_id ON custom_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_workouts_is_public ON custom_workouts(is_public);
CREATE INDEX IF NOT EXISTS idx_custom_workout_exercises_workout_id ON custom_workout_exercises(custom_workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_likes_workout_id ON workout_likes(custom_workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_likes_user_id ON workout_likes(user_id);

-- Verification queries to check if policies are working:
-- SELECT * FROM pg_policies WHERE tablename IN ('custom_workouts', 'custom_workout_exercises', 'workout_sessions', 'workout_exercise_results', 'workout_likes');