-- Migration: Add source column to planner_events for event origin tracking
ALTER TABLE planner_events ADD COLUMN source TEXT NULL; -- e.g. 'library', 'community', 'creator', 'external', 'other'