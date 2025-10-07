-- Migration: Add reminders to planner_events
ALTER TABLE planner_events
ADD COLUMN reminder_minutes_before INTEGER NULL; -- e.g. 10 = 10 minutes before event

-- Optionally, add an index if you plan to filter by reminders
-- CREATE INDEX IF NOT EXISTS idx_planner_events_reminder ON planner_events (reminder_minutes_before);
