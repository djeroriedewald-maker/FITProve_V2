-- Migration: Add recurring event support to planner_events
ALTER TABLE planner_events
ADD COLUMN recurrence_rule TEXT NULL, -- e.g. 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR'
ADD COLUMN recurrence_end DATE NULL;  -- last date for recurrence (inclusive)

-- Optionally, add an index for recurrence queries
CREATE INDEX IF NOT EXISTS idx_planner_events_recurrence_rule ON planner_events (recurrence_rule);
CREATE INDEX IF NOT EXISTS idx_planner_events_recurrence_end ON planner_events (recurrence_end);

-- You may need to update RLS policies if you filter by recurrence fields.
-- See setup-rls-policies.sql for reference.
