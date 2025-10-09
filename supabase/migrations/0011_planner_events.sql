-- Migration: Create planner_events table with full functionality
-- Description: Workout planner with recurring events, reminders, and rest days

-- Create the planner_events table
CREATE TABLE IF NOT EXISTS public.planner_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,

    -- Event details
    date date NOT NULL,
    type text NOT NULL CHECK (type IN ('workout', 'rest')),
    title text,
    notes text,

    -- Workout specific
    workout_id uuid,
    workout_type text,
    duration_min integer,
    time text,
    completed boolean DEFAULT false,

    -- Appearance
    color varchar(16),
    source text,

    -- Recurring events
    recurring_rule text,
    recurrence_end date,
    parent_event_id uuid REFERENCES public.planner_events(id) ON DELETE CASCADE,

    -- Reminders
    reminder_minutes integer,
    reminder_sent boolean DEFAULT false,

    -- Metadata
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_planner_events_user_date ON public.planner_events(user_id, date);
CREATE INDEX IF NOT EXISTS idx_planner_events_type ON public.planner_events(type);
CREATE INDEX IF NOT EXISTS idx_planner_events_recurring ON public.planner_events(recurring_rule) WHERE recurring_rule IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_planner_events_reminders ON public.planner_events(user_id, date, reminder_minutes) WHERE reminder_minutes IS NOT NULL AND reminder_sent = false;
CREATE INDEX IF NOT EXISTS idx_planner_events_parent ON public.planner_events(parent_event_id) WHERE parent_event_id IS NOT NULL;

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION public.update_planner_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_planner_events_updated_at
    BEFORE UPDATE ON public.planner_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_planner_events_updated_at();

-- Enable Row Level Security
ALTER TABLE public.planner_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own planner events"
    ON public.planner_events
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planner events"
    ON public.planner_events
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planner events"
    ON public.planner_events
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planner events"
    ON public.planner_events
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to generate recurring events
CREATE OR REPLACE FUNCTION public.generate_recurring_events(
    p_event_id uuid,
    p_start_date date,
    p_end_date date
)
RETURNS void AS $$
DECLARE
    v_event record;
    v_current_date date;
    v_interval interval;
BEGIN
    -- Get the parent event
    SELECT * INTO v_event
    FROM public.planner_events
    WHERE id = p_event_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event not found';
    END IF;

    -- Determine interval based on recurring_rule
    CASE v_event.recurring_rule
        WHEN 'daily' THEN v_interval := '1 day'::interval;
        WHEN 'weekly' THEN v_interval := '1 week'::interval;
        WHEN 'biweekly' THEN v_interval := '2 weeks'::interval;
        WHEN 'monthly' THEN v_interval := '1 month'::interval;
        ELSE RETURN;
    END CASE;

    -- Generate recurring instances
    v_current_date := v_event.date + v_interval;

    WHILE v_current_date <= LEAST(p_end_date, COALESCE(v_event.recurrence_end, p_end_date)) LOOP
        -- Only insert if not already exists
        IF NOT EXISTS (
            SELECT 1 FROM public.planner_events
            WHERE user_id = v_event.user_id
            AND date = v_current_date
            AND parent_event_id = p_event_id
        ) THEN
            INSERT INTO public.planner_events (
                user_id, date, type, title, notes,
                workout_id, workout_type, duration_min, time,
                color, source, recurring_rule, parent_event_id,
                reminder_minutes
            ) VALUES (
                v_event.user_id, v_current_date, v_event.type, v_event.title, v_event.notes,
                v_event.workout_id, v_event.workout_type, v_event.duration_min, v_event.time,
                v_event.color, v_event.source, v_event.recurring_rule, p_event_id,
                v_event.reminder_minutes
            );
        END IF;

        v_current_date := v_current_date + v_interval;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upcoming reminders (for cron job)
CREATE OR REPLACE FUNCTION public.get_pending_reminders(
    p_check_window_minutes integer DEFAULT 15
)
RETURNS TABLE (
    event_id uuid,
    user_id uuid,
    event_title text,
    event_date date,
    event_time text,
    reminder_minutes integer,
    user_email text,
    user_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pe.id,
        pe.user_id,
        pe.title,
        pe.date,
        pe.time,
        pe.reminder_minutes,
        au.email,
        p.full_name
    FROM public.planner_events pe
    JOIN auth.users au ON pe.user_id = au.id
    LEFT JOIN public.profiles p ON pe.user_id = p.id
    WHERE
        pe.reminder_minutes IS NOT NULL
        AND pe.reminder_sent = false
        AND pe.completed = false
        AND (
            -- Events happening soon (within check window)
            (pe.time IS NOT NULL AND
             pe.date::timestamp + pe.time::time - (pe.reminder_minutes || ' minutes')::interval
             BETWEEN now() AND now() + (p_check_window_minutes || ' minutes')::interval)
            OR
            -- Events without specific time (use start of day)
            (pe.time IS NULL AND
             pe.date::timestamp - (pe.reminder_minutes || ' minutes')::interval
             BETWEEN now() AND now() + (p_check_window_minutes || ' minutes')::interval)
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark reminder as sent
CREATE OR REPLACE FUNCTION public.mark_reminder_sent(p_event_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.planner_events
    SET reminder_sent = true
    WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE public.planner_events IS 'User workout planner with recurring events and reminders';
COMMENT ON COLUMN public.planner_events.recurring_rule IS 'Recurrence pattern: daily, weekly, biweekly, monthly';
COMMENT ON COLUMN public.planner_events.parent_event_id IS 'Reference to parent event for recurring instances';
COMMENT ON COLUMN public.planner_events.reminder_minutes IS 'Minutes before event to send reminder';
COMMENT ON FUNCTION public.generate_recurring_events IS 'Generate recurring event instances for a given date range';
COMMENT ON FUNCTION public.get_pending_reminders IS 'Get events that need reminder notifications sent';
