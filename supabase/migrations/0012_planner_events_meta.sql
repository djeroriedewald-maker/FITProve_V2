-- Migration: Add meta column for planner events
ALTER TABLE public.planner_events
ADD COLUMN IF NOT EXISTS meta JSONB NULL;
