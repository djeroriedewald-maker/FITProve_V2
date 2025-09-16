# Workout Creator Database Migration Instructions

## How to Apply the Migration

Since we don't have direct Supabase CLI access, you'll need to apply the migration manually through the Supabase dashboard:

### Steps:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Navigate to your project: https://kktyvxhwhuejotsqnbhn.supabase.co

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy Migration SQL**
   - Open the file: `supabase/migrations/0009_workout_creator_schema.sql`
   - Copy the entire contents

4. **Execute Migration**
   - Paste the SQL into the SQL Editor
   - Click "Run" to execute
   - You should see success messages for each table created

### Tables Created:

- ✅ `custom_workouts` - Stores user-created workout templates
- ✅ `custom_workout_exercises` - Exercise details within workouts  
- ✅ `workout_sessions` - Tracks actual workout executions
- ✅ `workout_exercise_results` - Detailed per-exercise performance data

### After Migration:

1. **Test Database**
   - Run: `npm run test:database` (if available)
   - Or manually test in SQL Editor: `SELECT * FROM custom_workouts LIMIT 1;`

2. **Update Frontend**
   - Switch from mock service to real service
   - Test workout creation end-to-end

### Verification:

```sql
-- Check that all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('custom_workouts', 'custom_workout_exercises', 'workout_sessions', 'workout_exercise_results');
```

Expected result: 4 rows showing all table names.

## Alternative: Use Migration Script

If you prefer to use the script (requires admin access):

```bash
cd scripts
npx ts-node apply-migration.ts
```

Note: This will simulate the migration but may not have full execution permissions.