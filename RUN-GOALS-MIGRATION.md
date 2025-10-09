# Run Goals Table Migration

This migration creates the `goals` table for workout goal tracking.

## Option 1: Run via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Click **+ New Query**
5. Copy the contents of `supabase/migrations/0012_goals_table.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Ctrl+Enter)

## Option 2: Run via Supabase CLI

```bash
# Make sure you're in the project directory
cd /c/Users/djero/.vscode/fitprove_v2

# Run the migration
npx supabase db push

# Or if you have Supabase CLI installed globally:
supabase db push
```

## What This Migration Does

1. **Creates `goals` table** with the following columns:
   - `id` - Primary key (UUID)
   - `user_id` - References auth.users
   - `type` - Goal type (workouts_per_week, workout_minutes, etc.)
   - `title` - Goal title
   - `description` - Optional description
   - `target_value` - Target value to achieve
   - `current_value` - Current progress value
   - `unit` - Unit of measurement (workouts, minutes, kg, etc.)
   - `deadline` - Optional deadline
   - `status` - Goal status (active, completed, abandoned, paused)
   - `created_at` - Creation timestamp
   - `updated_at` - Last update timestamp
   - `completed_at` - Completion timestamp

2. **Creates indexes** for better query performance:
   - Index on `user_id`
   - Index on `status`
   - Index on `created_at`

3. **Enables Row Level Security (RLS)** with policies:
   - Users can only view their own goals
   - Users can only create their own goals
   - Users can only update their own goals
   - Users can only delete their own goals

4. **Creates trigger** to automatically update `updated_at` timestamp

## Verify Migration

After running the migration, verify it worked:

```sql
-- Check if table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'goals';

-- Check table structure
\d goals

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'goals';
```

## Next Steps

After running the migration, the goals feature will be fully functional in your app:
- Users can create goals from templates on the StatsPage
- Goals automatically update progress based on workout stats
- Goals display with progress bars and deadline tracking
