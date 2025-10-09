# 🚀 Deploy Planner Backend (Recurring Events & Reminders)

Complete step-by-step guide to deploy the planner backend features.

---

## ✅ Step 1: Add Database Functions

These functions handle recurring event generation and reminder checks.

### 1.1 Open Supabase SQL Editor
👉 https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/sql/new

### 1.2 Copy and Run This SQL

Copy **all content** from `add-planner-functions.sql` and run it in the SQL Editor.

Or copy this:

```sql
-- See add-planner-functions.sql for the complete SQL
```

### 1.3 Verify Functions Were Created

Run this to check:

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%planner%'
OR routine_name LIKE '%reminder%';
```

You should see:
- ✅ `generate_recurring_events` (function)
- ✅ `get_pending_reminders` (function)
- ✅ `mark_reminder_sent` (function)

---

## ✅ Step 2: Deploy Edge Function

The Edge Function sends reminder notifications.

### Option A: Using Supabase Dashboard (Easiest)

1. **Go to Edge Functions:**
   👉 https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/functions

2. **Click "Create a new function"**

3. **Function name:** `send-planner-reminders`

4. **Copy the code** from `supabase/functions/send-planner-reminders/index.ts`

5. **Click "Deploy"**

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref kktyvxhwhuejotsqnbhn

# Deploy the function
supabase functions deploy send-planner-reminders
```

### 2.1 Verify Deployment

Test the function manually:

```bash
curl -X POST 'https://kktyvxhwhuejotsqnbhn.supabase.co/functions/v1/send-planner-reminders' \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

You should see: `{"success":true,"message":"Processed 0 reminders",...}`

---

## ✅ Step 3: Set Up CRON Job for Automated Reminders

You need to run the Edge Function every 15 minutes to check for pending reminders.

### Option A: Using pg_cron (Recommended - Built into Supabase)

1. **Enable pg_cron extension** (if not already enabled):

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

2. **Create CRON job** to run every 15 minutes:

```sql
SELECT cron.schedule(
    'send-planner-reminders',           -- Job name
    '*/15 * * * *',                      -- Every 15 minutes
    $$
    SELECT
      net.http_post(
          url:='https://kktyvxhwhuejotsqnbhn.supabase.co/functions/v1/send-planner-reminders',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
      ) as request_id;
    $$
);
```

**⚠️ Important:** Replace `YOUR_SERVICE_ROLE_KEY` with your actual service role key from `.env`

3. **Verify CRON job is running:**

```sql
SELECT * FROM cron.job;
```

### Option B: Using External CRON Service

If you prefer an external service (EasyCron, cron-job.org, GitHub Actions, etc.):

1. **Set up a CRON job** that runs every 15 minutes
2. **HTTP POST to:** `https://kktyvxhwhuejotsqnbhn.supabase.co/functions/v1/send-planner-reminders`
3. **Add header:** `Authorization: Bearer YOUR_ANON_KEY`

---

## ✅ Step 4: Test Everything End-to-End

### 4.1 Test Recurring Events

1. Go to your planner in the app
2. Add a new workout
3. Select "Weekly" from the recurring dropdown
4. Save the workout
5. Check that future instances appear on the calendar (next week, week after, etc.)

### 4.2 Test Reminders

1. Add a workout with a specific time (e.g., 3:00 PM today)
2. Set reminder to "15 minutes"
3. Wait until 2:45 PM
4. Check your notifications - you should receive a reminder!

### 4.3 Test Edit Recurring Event

1. Click on a recurring workout (has 🔄 icon)
2. Edit the title or duration
3. Select "Deze en toekomstige" (this and future)
4. Verify all future instances are updated

---

## 📊 Monitoring & Debugging

### Check Edge Function Logs

1. Go to: https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/functions/send-planner-reminders/logs
2. View execution logs to see:
   - How many reminders were processed
   - Any errors that occurred

### Check Reminder Status

```sql
-- See all events with reminders
SELECT id, title, date, time, reminder_minutes, reminder_sent
FROM planner_events
WHERE reminder_minutes IS NOT NULL
ORDER BY date, time;

-- See pending reminders (not yet sent)
SELECT * FROM get_pending_reminders(15);
```

### Manually Trigger Reminders (for testing)

```bash
curl -X POST 'https://kktyvxhwhuejotsqnbhn.supabase.co/functions/v1/send-planner-reminders' \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 🎉 You're Done!

Your planner now has:
- ✅ Recurring events (daily, weekly, biweekly, monthly)
- ✅ Automated reminder notifications
- ✅ Edit single or all future recurring instances
- ✅ Visual indicators (🔄 recurring, 🔔 reminders)
- ✅ Full backend automation

---

## 🔧 Troubleshooting

### "Function not found" error
- Make sure you ran `add-planner-functions.sql` successfully
- Check function exists: `\df public.*planner*` in psql

### "RLS policy violation"
- Already fixed! The `planner.service.ts` now adds `user_id` automatically

### Reminders not sending
- Check CRON job is running: `SELECT * FROM cron.job;`
- Check Edge Function logs for errors
- Verify reminder time is in the future

### Recurring events not generating
- Check if `recurring_rule` column exists
- Verify `generate_recurring_events()` function exists
- Check browser console for service errors
