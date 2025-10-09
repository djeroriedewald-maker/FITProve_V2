-- Add recurring and reminder columns to existing planner_events table
-- This is safe to run multiple times (uses IF NOT EXISTS checks)

-- Add recurring_rule column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'planner_events' AND column_name = 'recurring_rule') THEN
        ALTER TABLE planner_events ADD COLUMN recurring_rule text;
    END IF;
END $$;

-- Add recurrence_end column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'planner_events' AND column_name = 'recurrence_end') THEN
        ALTER TABLE planner_events ADD COLUMN recurrence_end date;
    END IF;
END $$;

-- Add parent_event_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'planner_events' AND column_name = 'parent_event_id') THEN
        ALTER TABLE planner_events ADD COLUMN parent_event_id uuid REFERENCES planner_events(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add reminder_minutes column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'planner_events' AND column_name = 'reminder_minutes') THEN
        ALTER TABLE planner_events ADD COLUMN reminder_minutes integer;
    END IF;
END $$;

-- Add reminder_sent column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'planner_events' AND column_name = 'reminder_sent') THEN
        ALTER TABLE planner_events ADD COLUMN reminder_sent boolean DEFAULT false;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_planner_events_recurring ON planner_events(recurring_rule) WHERE recurring_rule IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_planner_events_reminders ON planner_events(user_id, date, reminder_minutes) WHERE reminder_minutes IS NOT NULL AND reminder_sent = false;
CREATE INDEX IF NOT EXISTS idx_planner_events_parent ON planner_events(parent_event_id) WHERE parent_event_id IS NOT NULL;
