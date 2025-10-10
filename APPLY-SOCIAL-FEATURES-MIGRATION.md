# 🚀 Apply Social Features Migration

## Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your **fitprove_v2** project
3. Click on **SQL Editor** in the left sidebar

## Step 2: Run the Migration

1. Click **New Query**
2. Copy the entire contents of this file:
   ```
   supabase/migrations/0017_social_features_complete.sql
   ```
3. Paste it into the SQL editor
4. Click **Run** (or press Ctrl+Enter)

## Step 3: Verify Tables Were Created

Run this query to check if all tables were created successfully:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'workout_comments',
  'comment_likes',
  'workout_ratings',
  'workout_favorites',
  'user_follows',
  'notifications',
  'workout_views'
)
ORDER BY table_name;
```

You should see **7 tables** returned.

## Step 4: Verify Columns Were Added

Check if new columns were added to `custom_workouts`:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'custom_workouts'
AND column_name IN (
  'average_rating',
  'rating_count',
  'favorite_count',
  'view_count'
);
```

You should see **4 columns** returned.

## Step 5: Verify Triggers

Check if all triggers were created:

```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN (
  'comment_like_count_trigger',
  'comment_reply_count_trigger',
  'workout_rating_average_trigger',
  'workout_favorite_count_trigger',
  'follower_counts_trigger',
  'workout_view_count_trigger',
  'new_follower_notification_trigger',
  'workout_like_notification_trigger',
  'new_comment_notification_trigger'
)
ORDER BY trigger_name;
```

You should see **9 triggers** returned.

## Step 6: Test RLS Policies

Check if Row Level Security policies are in place:

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN (
  'workout_comments',
  'comment_likes',
  'workout_ratings',
  'workout_favorites',
  'user_follows',
  'notifications',
  'workout_views'
)
ORDER BY tablename, policyname;
```

You should see multiple policies for each table.

## ✅ Success Criteria

After running the migration, you should have:

- ✅ 7 new tables created
- ✅ 4 new columns in `custom_workouts`
- ✅ 4 new columns in `profiles` (follower_count, following_count, workout_count)
- ✅ 9 triggers set up
- ✅ RLS policies enabled on all new tables
- ✅ 2 views created (popular_workouts, user_activity_feed)

## 🐛 Troubleshooting

### Error: "relation already exists"
This means the table already exists. You can either:
1. Drop the table first: `DROP TABLE table_name CASCADE;`
2. Or skip that part of the migration

### Error: "column already exists"
The migration uses `DO $$ BEGIN ... EXCEPTION WHEN duplicate_column ...` blocks to handle this gracefully. This is not an error.

### Error: "trigger already exists"
Drop the trigger first:
```sql
DROP TRIGGER IF EXISTS trigger_name ON table_name;
```

## 📝 Notes

- This migration is **non-destructive** - it won't delete any existing data
- All new tables have RLS enabled by default
- Triggers will automatically maintain counts (likes, comments, follows, etc.)
- Notifications will be automatically created for follows, likes, and comments

## 🎉 After Migration

Once the migration is complete, come back to the code and I'll help you:
1. ✅ Mark the migration as complete
2. 🎨 Build the UI components
3. 🔗 Connect everything together

---

**Need help?** Let me know if you encounter any errors!