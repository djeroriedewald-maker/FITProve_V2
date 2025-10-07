-- Migration: Add color customization to planner_events
ALTER TABLE planner_events
ADD COLUMN color VARCHAR(16) NULL; -- e.g. '#FF7A18' or 'cyan'

-- Optionally, add an index if you plan to filter by color
-- CREATE INDEX IF NOT EXISTS idx_planner_events_color ON planner_events (color);
