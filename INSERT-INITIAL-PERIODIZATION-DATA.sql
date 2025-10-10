-- Insert Initial Periodization Data
-- Run this AFTER confirming you're logged in and have a user account
-- This creates your initial periodization record

-- First, let's check if you already have periodization data
SELECT
  id,
  goal,
  current_week,
  macro_phase,
  micro_week,
  is_deload_week,
  created_at
FROM public.user_periodization
WHERE user_id = auth.uid();

-- If the query above returns no rows, run this INSERT:
-- (Make sure to uncomment and adjust the goal to match your fitness profile)

/*
INSERT INTO public.user_periodization (
  user_id,
  goal,
  current_week,
  total_weeks_completed,
  workouts_this_week,
  macro_phase,
  macro_cycle_started_at,
  micro_week,
  is_deload_week,
  last_deload_week,
  weeks_since_last_deload,
  next_deload_week,
  current_volume_multiplier,
  current_intensity_multiplier
)
VALUES (
  auth.uid(),                    -- Your user ID
  'muscle',                      -- Change this to your goal: 'strength', 'muscle', 'endurance', 'weight-loss', 'event', or 'wellness'
  1,                            -- Starting at week 1
  0,                            -- No weeks completed yet
  0,                            -- No workouts this week yet
  'base',                       -- Starting in base phase
  NOW(),                        -- Macro cycle starts now
  'week1',                      -- Starting in week 1 of micro cycle
  false,                        -- Not a deload week
  NULL,                         -- No previous deload
  0,                            -- 0 weeks since last deload
  4,                            -- Next deload at week 4
  1.0,                          -- Normal volume (100%)
  1.0                           -- Normal intensity (100%)
);
*/

-- After inserting, verify it was created:
SELECT
  id,
  goal,
  current_week,
  macro_phase,
  micro_week,
  is_deload_week,
  current_volume_multiplier,
  current_intensity_multiplier,
  created_at
FROM public.user_periodization
WHERE user_id = auth.uid();
