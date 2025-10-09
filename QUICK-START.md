# ⚡ Quick Start - Planner Backend Deployment

## 🎯 What You Need To Do

Unfortunately, **Supabase requires manual deployment** via their dashboard for:
- SQL functions (security reasons)
- Edge Functions (code deployment)
- CRON jobs (scheduling)

I've prepared everything - you just need to **copy & paste** in 3 places! ⏱️ ~5 minutes

---

## 📋 Step-by-Step Guide

### STEP 1: Fix Reminder Function (2 min)

1. **Open:** https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/sql/new

2. **Copy & Paste this SQL:**

```sql
-- Fix get_pending_reminders function to use correct column name
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
        COALESCE(p.display_name, au.email) as user_name
    FROM public.planner_events pe
    JOIN auth.users au ON pe.user_id = au.id
    LEFT JOIN public.profiles p ON pe.user_id = p.id
    WHERE
        pe.reminder_minutes IS NOT NULL
        AND pe.reminder_sent = false
        AND pe.completed = false
        AND (
            (pe.time IS NOT NULL AND
             pe.date::timestamp + pe.time::time - (pe.reminder_minutes || ' minutes')::interval
             BETWEEN now() AND now() + (p_check_window_minutes || ' minutes')::interval)
            OR
            (pe.time IS NULL AND
             pe.date::timestamp - (pe.reminder_minutes || ' minutes')::interval
             BETWEEN now() AND now() + (p_check_window_minutes || ' minutes')::interval)
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

3. **Click RUN** ✅

---

### STEP 2: Deploy Edge Function (2 min)

1. **Open:** https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/functions

2. **Click** "Create a new function"

3. **Function name:** `send-planner-reminders`

4. **Copy code from:** `supabase/functions/send-planner-reminders/index.ts`
   (Or see full code in output above from `node deploy-direct.js`)

5. **Click Deploy** ✅

---

### STEP 3: Setup CRON Job (1 min)

1. **Open:** https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/sql/new

2. **Copy & Paste this SQL:**

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Unschedule old job if exists
SELECT cron.unschedule('send-planner-reminders');

-- Create CRON job (runs every 15 minutes)
SELECT cron.schedule(
    'send-planner-reminders',
    '*/15 * * * *',
    $$
    SELECT
      net.http_post(
          url:='https://kktyvxhwhuejotsqnbhn.supabase.co/functions/v1/send-planner-reminders',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTIyNywiZXhwIjoyMDczMzIxMjI3fQ.QAuP8-IBj3vRB6yY3UC2ngUcnvppYyaDLxsX8B3eU9M"}'::jsonb
      ) as request_id;
    $$
);

-- Verify CRON job is created
SELECT * FROM cron.job WHERE jobname = 'send-planner-reminders';
```

3. **Click RUN** ✅

---

## ✅ Verify It Works

Run this in your terminal:

```bash
node test-deployment.js
```

Or test manually:

**1. Test SQL Function:**
```sql
SELECT * FROM get_pending_reminders(15);
```

**2. Test Edge Function:**
```bash
curl -X POST "https://kktyvxhwhuejotsqnbhn.supabase.co/functions/v1/send-planner-reminders" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E"
```

**Expected:** `{"success":true,"message":"Processed 0 reminders",...}`

**3. Check CRON:**
```sql
SELECT jobid, jobname, schedule, active FROM cron.job;
```

---

## 🎉 Done!

Your planner now has:
- ✅ Fixed reminder function
- ✅ Automated reminders (every 15 minutes)
- ✅ Edge Function processing
- ✅ Full backend automation

---

## 📚 Additional Resources

- Full details: [DEPLOY-NOW.md](DEPLOY-NOW.md)
- Migration status: [MIGRATION-STATUS.md](MIGRATION-STATUS.md)
- Run instructions: `node deploy-direct.js`
