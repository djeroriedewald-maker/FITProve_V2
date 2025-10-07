-- Migration: Add workout_type and external columns to planner_events for advanced event support
ALTER TABLE planner_events ADD COLUMN workout_type TEXT NULL;
ALTER TABLE planner_events ADD COLUMN external BOOLEAN NULL;