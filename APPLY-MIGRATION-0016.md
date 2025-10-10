# Apply Migration 0016 - Add Workout Style Column

**Date**: October 10, 2025
**Migration File**: `supabase/migrations/0016_add_workout_style_column.sql`

---

## 🎯 What This Does

Adds a `workout_style` column to the `workout_sessions` table to track what type of workout style was used (EMOM, AMRAP, Circuit, Traditional, etc.).

This enables the **Workout Styles Breakdown** component to show real data from your workout history.

---

## 📋 SQL to Run in Supabase Dashboard

Go to **Supabase Dashboard** → **SQL Editor** → **New Query** and run:

```sql
-- Add workout_style column to workout_sessions table
-- This tracks the type of workout style used (EMOM, AMRAP, Circuit, etc.)

ALTER TABLE public.workout_sessions
ADD COLUMN IF NOT EXISTS workout_style TEXT DEFAULT 'traditional';

-- Add comment
COMMENT ON COLUMN public.workout_sessions.workout_style IS 'Workout style type: traditional, emom, amrap, circuit, superset, etc.';

-- Create index for filtering by style
CREATE INDEX IF NOT EXISTS idx_workout_sessions_style
ON public.workout_sessions(workout_style);
```

---

## ✅ Verification

After running the SQL, verify it worked:

```sql
-- Check if column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'workout_sessions'
AND column_name = 'workout_style';

-- Should return:
-- column_name   | data_type | column_default
-- workout_style | text      | 'traditional'::text
```

---

## 📊 What This Enables

After applying this migration, the profile page will be able to:

1. ✅ Load real workout style distribution from your history
2. ✅ Show percentage breakdowns (40% Traditional, 30% Circuit, etc.)
3. ✅ Display most-used workout style
4. ✅ Calculate style variety metrics

**Before**: Uses mock data (4 sample styles)
**After**: Uses real data from your `workout_sessions` table

---

## 🔄 Backward Compatibility

- ✅ **Non-breaking**: Uses `ADD COLUMN IF NOT EXISTS`
- ✅ **Safe default**: Existing rows get `'traditional'` as default value
- ✅ **No data loss**: Preserves all existing workout session data

---

## 🚀 Next Steps

1. **Apply this migration** (SQL above)
2. **Restart your dev server** (types will be updated)
3. **Navigate to `/profile`** - Workout styles will use real data!

---

**Status**: Ready to apply
**Impact**: Low risk, backward compatible
**Benefit**: Real workout style tracking on profile page
