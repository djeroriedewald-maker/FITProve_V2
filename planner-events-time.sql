-- Migration: Add time column to planner_events for event time support
ALTER TABLE planner_events ADD COLUMN time TEXT NULL; -- or use TIME type if supported by your DB
