# 🚨 REQUIRED: Run This Database Migration

## The app is showing errors because the database is missing the new columns for recurring events and reminders.

### Quick Fix (5 minutes):

1. **Open Supabase SQL Editor:**
   👉 https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/sql/new

2. **Copy the entire content of `add-recurring-columns.sql`** (in this folder)

3. **Paste it into the SQL Editor**

4. **Click "Run"** (or press Ctrl+Enter)

5. **Refresh your app** - the errors will be gone!

---

### What This Migration Does:

✅ Adds `recurring_rule` column - stores daily/weekly/monthly patterns
✅ Adds `recurrence_end` column - when recurring events should stop
✅ Adds `parent_event_id` column - links recurring instances to parent
✅ Adds `reminder_minutes` column - how many minutes before to remind
✅ Adds `reminder_sent` column - tracks if reminder was sent
✅ Creates performance indexes for these columns

### Safe to Run:

- ✅ Will not break existing data
- ✅ Uses `IF NOT EXISTS` checks
- ✅ Can be run multiple times safely
- ✅ Only adds missing columns

---

## Alternative: Use the comprehensive migration

If you prefer, you can also run the full migration from:
`supabase/migrations/0011_planner_events.sql`

This will create the complete table structure with all functions and RLS policies.
However, if the table already exists, you'll need to drop it first or just use the simpler `add-recurring-columns.sql` approach.
