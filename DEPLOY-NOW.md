# 🚀 Deployment Instructions - Execute Now

## Task 1: Fix Reminder Function ⚡

### Step 1.1: Open Supabase SQL Editor
🔗 **Go to:** https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/sql/new

### Step 1.2: Copy & Paste This SQL
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

COMMENT ON FUNCTION public.get_pending_reminders IS 'Get events that need reminder notifications sent (fixed to use display_name)';
```

### Step 1.3: Click "RUN" ✅

---

## Task 4: Deploy Planner Backend 🎯

### Step 2.1: Deploy Edge Function

**Option A: Via Supabase Dashboard (Recommended)**

1. **Navigate to Edge Functions:**
   🔗 https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/functions

2. **Click "Create a new function"**

3. **Function Name:** `send-planner-reminders`

4. **Copy this code:**

```typescript
// Supabase Edge Function: Send Planner Reminders
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReminderEvent {
  event_id: string;
  user_id: string;
  event_title: string;
  event_date: string;
  event_time: string | null;
  reminder_minutes: number;
  user_email: string;
  user_name: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: reminders, error } = await supabase
      .rpc('get_pending_reminders', { p_check_window_minutes: 15 });

    if (error) throw error;

    console.log(`Found ${reminders?.length || 0} pending reminders`);

    const results = {
      total: reminders?.length || 0,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const reminder of (reminders as ReminderEvent[]) || []) {
      try {
        const eventDateTime = reminder.event_time
          ? `${reminder.event_date} om ${reminder.event_time}`
          : reminder.event_date;

        console.log(`Sending reminder: ${reminder.event_title}`);

        await supabase.from('notifications').insert({
          user_id: reminder.user_id,
          type: 'planner_reminder',
          title: 'Workout Herinnering 🏋️',
          message: `"${reminder.event_title}" begint ${reminder.reminder_minutes === 1 ? 'over 1 minuut' : `over ${reminder.reminder_minutes} minuten`}!`,
          data: {
            event_id: reminder.event_id,
            event_title: reminder.event_title,
            event_date: reminder.event_date,
            event_time: reminder.event_time,
          },
          read: false,
        });

        await supabase.rpc('mark_reminder_sent', { p_event_id: reminder.event_id });
        results.sent++;
      } catch (err) {
        console.error(`Failed for event ${reminder.event_id}:`, err);
        results.failed++;
        results.errors.push(`${reminder.event_id}: ${err.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.total} reminders`,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
```

5. **Click "Deploy"** ✅

**Option B: Via Supabase CLI**
```bash
# If you have CLI installed and configured
supabase functions deploy send-planner-reminders
```

---

### Step 2.2: Test the Edge Function

Run this in your terminal:

```bash
curl -X POST "https://kktyvxhwhuejotsqnbhn.supabase.co/functions/v1/send-planner-reminders" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E" \
  -H "Content-Type: application/json"
```

✅ **Expected Response:**
```json
{"success":true,"message":"Processed 0 reminders","results":{"total":0,"sent":0,"failed":0,"errors":[]}}
```

---

### Step 2.3: Set Up Automated CRON Job

#### Option A: Using pg_cron (Built into Supabase)

1. **Go to SQL Editor:** https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/sql/new

2. **Enable pg_cron:**
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

3. **Create CRON job** (runs every 15 minutes):
```sql
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
```

4. **Verify CRON is running:**
```sql
SELECT * FROM cron.job;
```

You should see a job named `send-planner-reminders` with schedule `*/15 * * * *`

---

## ✅ Verification Checklist

After completing both tasks:

- [ ] **Task 1:** Run test query in SQL Editor:
```sql
SELECT * FROM get_pending_reminders(15);
```
Should return results without errors.

- [ ] **Task 4a:** Edge Function deployed and accessible at:
  `https://kktyvxhwhuejotsqnbhn.supabase.co/functions/v1/send-planner-reminders`

- [ ] **Task 4b:** CRON job scheduled and visible in:
```sql
SELECT jobid, jobname, schedule, active FROM cron.job;
```

- [ ] **Task 4c:** Test end-to-end:
  1. Create a planner event with reminder set for 15 minutes from now
  2. Wait 15 minutes
  3. Check notifications table for the reminder

---

## 📊 Monitoring

### View Edge Function Logs
🔗 https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/functions/send-planner-reminders/logs

### Check Pending Reminders
```sql
SELECT id, title, date, time, reminder_minutes, reminder_sent, completed
FROM planner_events
WHERE reminder_minutes IS NOT NULL
ORDER BY date, time;
```

### View CRON Job History
```sql
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-planner-reminders')
ORDER BY start_time DESC
LIMIT 10;
```

---

## 🎉 Success!

Once complete, your app will have:
- ✅ Fixed reminder function
- ✅ Automated reminder notifications every 15 minutes
- ✅ Edge Function processing pending reminders
- ✅ Full backend automation for planner

---

## 🆘 Need Help?

**Common Issues:**

1. **"Function not found" in CRON:**
   - Make sure Edge Function is deployed
   - Check function URL is correct

2. **"Column does not exist":**
   - Task 1 fixes this - make sure to run it first

3. **No reminders being sent:**
   - Check CRON job is active: `SELECT * FROM cron.job WHERE active = true;`
   - Check Edge Function logs for errors
   - Verify events have `reminder_minutes` set

4. **Permission errors:**
   - Make sure service role key is used in CRON job
   - Verify RLS policies on `notifications` table
