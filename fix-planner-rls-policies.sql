-- Fix RLS policies for planner_events table
-- This ensures users can insert, update, delete, and select their own events

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own planner events" ON planner_events;
DROP POLICY IF EXISTS "Users can insert their own planner events" ON planner_events;
DROP POLICY IF EXISTS "Users can update their own planner events" ON planner_events;
DROP POLICY IF EXISTS "Users can delete their own planner events" ON planner_events;

-- Enable RLS (if not already enabled)
ALTER TABLE planner_events ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can view their own planner events"
    ON planner_events
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planner events"
    ON planner_events
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planner events"
    ON planner_events
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planner events"
    ON planner_events
    FOR DELETE
    USING (auth.uid() = user_id);
