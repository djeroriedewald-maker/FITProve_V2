-- planner-events.sql
-- Migration: Create planner_events table for user-specific planner events (workouts, rest days, notes, etc.)

CREATE TABLE IF NOT EXISTS public.planner_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    date date NOT NULL,
    type text NOT NULL, -- e.g. 'workout', 'rest', 'note', 'goal', etc.
    title text,
    notes text,
    workout_id uuid, -- optional, link to custom_workouts or workouts
    duration_min integer,
    completed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index for fast user/date queries
CREATE INDEX IF NOT EXISTS idx_planner_events_user_date ON public.planner_events(user_id, date);

-- RLS: Only allow users to access their own events
ALTER TABLE public.planner_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own planner events" ON public.planner_events
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own planner events" ON public.planner_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own planner events" ON public.planner_events
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own planner events" ON public.planner_events
    FOR DELETE USING (auth.uid() = user_id);
