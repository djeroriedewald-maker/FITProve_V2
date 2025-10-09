-- Fix get_pending_reminders function with proper type casting
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
        au.email::text,  -- Cast to text
        COALESCE(p.display_name, au.email)::text as user_name  -- Cast to text
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

COMMENT ON FUNCTION public.get_pending_reminders IS 'Get events that need reminder notifications sent (fixed type casting)';
