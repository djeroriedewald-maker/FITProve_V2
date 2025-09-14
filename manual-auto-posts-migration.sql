-- Execute this in Supabase SQL Editor to add auto-post settings to profiles table
-- This extends the profile table with auto-posting preferences

-- Step 1: Add auto_post_settings column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS auto_post_settings jsonb DEFAULT '{
  "enabled": true,
  "onWorkoutCompletion": true,
  "onMilestones": true,
  "onStreaks": true,
  "minDurationMinutes": 10,
  "minCalories": 50,
  "cooldownHours": 2
}'::jsonb;

-- Step 2: Create function to handle workout completion triggers
CREATE OR REPLACE FUNCTION public.trigger_auto_post_on_workout_completion()
RETURNS trigger AS $$
DECLARE
  user_settings jsonb;
  workout_data jsonb;
  session_duration_minutes numeric := 0;
  session_data jsonb;
BEGIN
  -- Check if the trigger is called with expected NEW record structure
  IF NEW IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if this looks like a status change to 'completed'
  -- Handle different possible column names and structures
  BEGIN
    -- Try to detect completion status change
    IF (TG_OP = 'UPDATE' AND 
        ((NEW.status IS NOT NULL AND NEW.status = 'completed' AND 
          (OLD.status IS NULL OR OLD.status != 'completed')) OR
         (NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL))) THEN
      
      -- Get user's auto-post settings
      SELECT auto_post_settings INTO user_settings
      FROM public.profiles 
      WHERE id = NEW.user_id;
      
      -- Check if auto-posting is enabled
      IF user_settings->>'enabled' = 'true' AND user_settings->>'onWorkoutCompletion' = 'true' THEN
        
        -- Try to calculate session duration safely
        BEGIN
          IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
            session_duration_minutes := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))/60;
          END IF;
        EXCEPTION WHEN OTHERS THEN
          session_duration_minutes := 0;
        END;
        
        -- Try to get workout details if available
        BEGIN
          SELECT to_jsonb(w.*) INTO workout_data
          FROM public.workouts w
          WHERE w.id = NEW.workout_id
          LIMIT 1;
        EXCEPTION WHEN OTHERS THEN
          workout_data := '{}'::jsonb;
        END;
        
        -- Build session data from available columns
        session_data := jsonb_build_object(
          'trigger_type', 'auto_post',
          'session_id', NEW.id,
          'duration', session_duration_minutes
        );
        
        -- Add workout_id if available
        BEGIN
          session_data := session_data || jsonb_build_object('workout_id', NEW.workout_id);
        EXCEPTION WHEN OTHERS THEN
          NULL;
        END;
        
        -- Add workout data if retrieved
        IF workout_data IS NOT NULL AND workout_data != '{}'::jsonb THEN
          session_data := session_data || jsonb_build_object('workout_data', workout_data);
        END IF;
        
        -- Create a notification to trigger auto-post processing
        INSERT INTO public.notifications (
          user_id,
          type,
          title,
          message,
          data,
          read
        ) VALUES (
          NEW.user_id,
          'achievement',
          'Workout Completed',
          'Auto-post trigger for completed workout',
          session_data,
          true -- Mark as read since this is internal
        );
        
      END IF;
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the original operation
    RAISE WARNING 'Auto-post trigger failed: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create trigger on sessions table for workout completion (if table exists)
DO $$
BEGIN
  -- Check if sessions table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'sessions'
  ) THEN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS trigger_auto_post_workout_completion ON public.sessions;
    
    -- Create new trigger
    CREATE TRIGGER trigger_auto_post_workout_completion
      AFTER UPDATE ON public.sessions
      FOR EACH ROW 
      EXECUTE FUNCTION public.trigger_auto_post_on_workout_completion();
      
    RAISE NOTICE 'Auto-post trigger created on sessions table';
  ELSE
    RAISE NOTICE 'Sessions table not found - trigger will be created when table exists';
  END IF;
END $$;

-- Step 4: Create function to get workout session data for auto-posts
CREATE OR REPLACE FUNCTION public.get_workout_session_data(session_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb := '{}'::jsonb;
BEGIN
  -- Check if sessions table exists and get basic data
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'sessions'
  ) THEN
    
    -- Get basic session data (id and user_id should always exist)
    BEGIN
      SELECT jsonb_build_object('id', s.id, 'user_id', s.user_id) INTO result
      FROM public.sessions s
      WHERE s.id = session_id;
      
      IF result->>'id' IS NULL THEN
        RETURN '{"error": "Session not found"}'::jsonb;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      RETURN '{"error": "Could not access sessions table"}'::jsonb;
    END;
    
    -- Try to add more columns if they exist
    BEGIN
      -- Add workout_id if column exists
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'workout_id'
      ) THEN
        EXECUTE 'SELECT $1 || jsonb_build_object(''workout_id'', s.workout_id) FROM sessions s WHERE s.id = $2'
        INTO result USING result, session_id;
      END IF;
      
      -- Add timestamps if columns exist
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'started_at'
      ) THEN
        EXECUTE 'SELECT $1 || jsonb_build_object(''started_at'', s.started_at) FROM sessions s WHERE s.id = $2'
        INTO result USING result, session_id;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      -- Keep basic result if extended queries fail
      NULL;
    END;
    
  ELSE
    RETURN '{"error": "Sessions table not found"}'::jsonb;
  END IF;
  
  RETURN COALESCE(result, '{"error": "No data found"}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_workout_session_data(uuid) TO authenticated;

-- Step 6: Create index for better performance on sessions queries (if sessions table exists)
DO $$
DECLARE
  has_user_id boolean := false;
  has_completed_at boolean := false;
  has_status boolean := false;
BEGIN
  -- Check if sessions table exists before creating index
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'sessions'
  ) THEN
    
    -- Check which columns exist
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'sessions' 
      AND column_name = 'user_id'
    ) INTO has_user_id;
    
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'sessions' 
      AND column_name = 'completed_at'
    ) INTO has_completed_at;
    
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'sessions' 
      AND column_name = 'status'
    ) INTO has_status;
    
    -- Create index based on available columns
    IF has_user_id AND has_completed_at AND has_status THEN
      CREATE INDEX IF NOT EXISTS idx_sessions_user_completed 
      ON public.sessions(user_id, completed_at) 
      WHERE status = 'completed';
      RAISE NOTICE 'Created full index with status filter';
    ELSIF has_user_id AND has_completed_at THEN
      CREATE INDEX IF NOT EXISTS idx_sessions_user_completed 
      ON public.sessions(user_id, completed_at);
      RAISE NOTICE 'Created index without status filter';
    ELSIF has_user_id THEN
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id 
      ON public.sessions(user_id);
      RAISE NOTICE 'Created basic user_id index';
    ELSE
      RAISE NOTICE 'Sessions table found but no suitable columns for indexing';
    END IF;
    
  ELSE
    RAISE NOTICE 'Sessions table not found - no index created';
  END IF;
END $$;

-- Final verification: Check the updated table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name = 'auto_post_settings';