# Planner Backend Deployment Guide

This guide explains how to deploy the planner backend features including recurring events and reminders.

## 🗄️ Database Setup

### Step 1: Run Migration

Run the planner_events migration to create the table and functions:

```bash
# Using Supabase CLI
supabase db push supabase/migrations/0011_planner_events.sql

# Or manually in Supabase Dashboard SQL Editor
# Copy/paste the content of supabase/migrations/0011_planner_events.sql
```

This migration creates:
- ✅ `planner_events` table with all columns
- ✅ Indexes for performance
- ✅ RLS policies
- ✅ `generate_recurring_events()` function
- ✅ `get_pending_reminders()` function
- ✅ `mark_reminder_sent()` function

### Step 2: Verify Migration

Check that the table and functions exist:

```sql
-- Check table
SELECT * FROM planner_events LIMIT 1;

-- Check functions
SELECT routine_name
FROM information_schema.routines
WHERE routine_name LIKE '%planner%';
```

## 🔔 Reminders Setup

### Step 1: Deploy Edge Function

Deploy the reminder Edge Function to Supabase:

```bash
# Login to Supabase (if not already)
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy send-planner-reminders
```

### Step 2: Set Environment Variables

In Supabase Dashboard → Edge Functions → send-planner-reminders → Settings:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 3: Setup Cron Job

#### Option A: Supabase Cron (Recommended)

Create a cron job in Supabase Dashboard → Database → Cron Jobs:

```sql
-- Run every 15 minutes
SELECT cron.schedule(
  'send-planner-reminders',
  '*/15 * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://your-project.supabase.co/functions/v1/send-planner-reminders',
      headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
  $$
);
```

#### Option B: External Cron (Alternative)

Use a service like cron-job.org, GitHub Actions, or Vercel Cron:

```yaml
# .github/workflows/planner-reminders.yml
name: Send Planner Reminders
on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST \
            https://your-project.supabase.co/functions/v1/send-planner-reminders \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

## 🔄 Recurring Events Setup

### Frontend Integration

Update your `PlannerCalendar.tsx` to use the service:

```typescript
import {
  createWorkoutEvent,
  updateRecurringEvent,
  deleteRecurringEvent,
  generateRecurringEvents,
} from '../lib/planner.service';

// When creating a recurring workout
const handleCreateRecurringWorkout = async () => {
  const event = {
    date: '2025-10-15',
    type: 'workout' as const,
    title: 'Morning Run',
    workout_type: 'Run',
    duration_min: 30,
    recurring_rule: 'weekly',
    recurrence_end: '2025-12-31',
    reminder_minutes: 30,
  };

  // Generate events for next 3 months
  const endDate = moment().add(3, 'months').format('YYYY-MM-DD');

  const { data, error } = await createWorkoutEvent(event, endDate);

  if (!error) {
    toast.success('Recurring workout created!');
  }
};
```

### Auto-Generate Recurring Events

Add a function that runs periodically (e.g., nightly) to generate upcoming recurring events:

```typescript
// Run this weekly to generate next month's events
async function generateUpcomingRecurringEvents() {
  const { data: events } = await supabase
    .from('planner_events')
    .select('*')
    .not('recurring_rule', 'is', null)
    .is('parent_event_id', null);

  for (const event of events || []) {
    const startDate = moment().format('YYYY-MM-DD');
    const endDate = moment().add(1, 'month').format('YYYY-MM-DD');

    await generateRecurringEvents(event.id, startDate, endDate);
  }
}
```

## 📧 Notification Integration

The reminder system currently logs to console. Integrate with your notification system:

### Option 1: Use Supabase Notifications Table

The Edge Function already inserts into `notifications` table. Ensure this table exists:

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);
```

### Option 2: Push Notifications

Install push notification service (e.g., OneSignal, Firebase):

```typescript
// In edge function, replace notifications insert with:
await sendPushNotification({
  userId: reminder.user_id,
  title: 'Workout Herinnering 🏋️',
  body: `"${reminder.event_title}" begint over ${reminder.reminder_minutes} minuten!`,
  data: {
    type: 'planner_reminder',
    event_id: reminder.event_id,
  },
});
```

### Option 3: Email Notifications

Use email service (e.g., Resend, SendGrid):

```typescript
// In edge function:
await sendEmail({
  to: reminder.user_email,
  subject: 'Workout Herinnering 🏋️',
  html: `
    <h2>Hallo ${reminder.user_name}!</h2>
    <p>Je workout "${reminder.event_title}" begint over ${reminder.reminder_minutes} minuten.</p>
    <p>Datum: ${reminder.event_date} ${reminder.event_time || ''}</p>
  `,
});
```

## 🧪 Testing

### Test Database Functions

```sql
-- Test generate_recurring_events
INSERT INTO planner_events (user_id, date, type, title, recurring_rule)
VALUES (auth.uid(), '2025-10-15', 'workout', 'Test Workout', 'weekly');

-- Get the inserted event ID
SELECT id FROM planner_events WHERE title = 'Test Workout' LIMIT 1;

-- Generate instances
SELECT generate_recurring_events(
  'event-id-here',
  '2025-10-15'::date,
  '2025-12-31'::date
);

-- Verify generated events
SELECT * FROM planner_events WHERE parent_event_id = 'event-id-here';
```

### Test Reminder Function

```sql
-- Test get_pending_reminders
SELECT * FROM get_pending_reminders(15);
```

### Test Edge Function Locally

```bash
# Start Supabase functions locally
supabase functions serve send-planner-reminders

# Call the function
curl -X POST http://localhost:54321/functions/v1/send-planner-reminders \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## 🚀 Production Checklist

- [ ] Database migration applied
- [ ] Edge function deployed
- [ ] Environment variables set
- [ ] Cron job configured
- [ ] Notifications table created (if using)
- [ ] RLS policies verified
- [ ] Test reminder sent successfully
- [ ] Test recurring event generated
- [ ] Monitor Edge Function logs
- [ ] Set up error alerting

## 📊 Monitoring

### Check Edge Function Logs

Supabase Dashboard → Edge Functions → send-planner-reminders → Logs

### Monitor Reminder Success Rate

```sql
-- Check how many reminders were sent today
SELECT
  COUNT(*) FILTER (WHERE reminder_sent = true) as sent,
  COUNT(*) FILTER (WHERE reminder_sent = false) as pending,
  COUNT(*) as total
FROM planner_events
WHERE reminder_minutes IS NOT NULL
  AND date = CURRENT_DATE;
```

### Monitor Recurring Events

```sql
-- Check recurring events generated
SELECT
  parent_event_id,
  COUNT(*) as instances,
  MIN(date) as first_date,
  MAX(date) as last_date
FROM planner_events
WHERE parent_event_id IS NOT NULL
GROUP BY parent_event_id;
```

## 🛠️ Troubleshooting

### Reminders Not Sending

1. Check Edge Function logs
2. Verify cron job is running
3. Check `get_pending_reminders()` returns events
4. Verify environment variables are set

### Recurring Events Not Generating

1. Check `recurring_rule` is set correctly
2. Verify `generate_recurring_events()` function exists
3. Check RLS policies allow inserts
4. Verify date range is correct

## 📚 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase Cron Jobs](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)

## 🔐 Security Notes

- Edge Function uses service role key (keep secure!)
- RLS policies ensure users only see their own events
- Reminders respect user privacy
- All data encrypted at rest
- Use HTTPS for all API calls
