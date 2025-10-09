-- Add database functions for recurring events and reminders
-- Safe to run multiple times (uses CREATE OR REPLACE)

-- Function 1: Generate recurring event instances
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

-- Function 2: Get pending reminders (for cron job)
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

-- Function 3: Mark reminder as sent
CREATE OR REPLACE FUNCTION public.mark_reminder_sent(p_event_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.planner_events
    SET reminder_sent = true
    WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments
COMMENT ON FUNCTION public.generate_recurring_events IS 'Generate recurring event instances for a given date range';
COMMENT ON FUNCTION public.get_pending_reminders IS 'Get events that need reminder notifications sent (checks within time window)';
COMMENT ON FUNCTION public.mark_reminder_sent IS 'Mark a reminder as sent to prevent duplicate notifications';
