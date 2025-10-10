-- ============================================
-- VERIFICATION SCRIPT FOR SOCIAL FEATURES
-- Run this after applying migration 0017
-- ============================================

-- 1. Check if all tables exist
SELECT
  table_name,
  CASE
    WHEN table_name IN (
      'workout_comments',
      'comment_likes',
      'workout_ratings',
      'workout_favorites',
      'user_follows',
      'notifications',
      'workout_views'
    ) THEN ' EXISTS'
    ELSE 'L MISSING'
  END as status
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

-- Expected: 7 rows

-- ============================================

-- 2. Check new columns in custom_workouts
SELECT
  column_name,
  data_type,
  ' ADDED' as status
FROM information_schema.columns
WHERE table_name = 'custom_workouts'
AND column_name IN (
  'average_rating',
  'rating_count',
  'favorite_count',
  'view_count'
)
ORDER BY column_name;

-- Expected: 4 rows

-- ============================================

-- 3. Check new columns in profiles
SELECT
  column_name,
  data_type,
  ' ADDED' as status
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN (
  'follower_count',
  'following_count',
  'workout_count'
)
ORDER BY column_name;

-- Expected: 3 rows

-- ============================================

-- 4. Check triggers
SELECT
  trigger_name,
  event_object_table as table_name,
  ' ACTIVE' as status
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

-- Expected: 9 rows

-- ============================================

-- 5. Check RLS policies count per table
SELECT
  tablename,
  COUNT(*) as policy_count,
  ' PROTECTED' as status
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
GROUP BY tablename
ORDER BY tablename;

-- Expected: 7 rows with policy_count > 0

-- ============================================

-- 6. Check if views were created
SELECT
  table_name as view_name,
  ' CREATED' as status
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN (
  'popular_workouts',
  'user_activity_feed'
)
ORDER BY table_name;

-- Expected: 2 rows

-- ============================================

-- 7. Check if helper functions exist
SELECT
  routine_name as function_name,
  ' AVAILABLE' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'create_notification',
  'update_comment_like_count',
  'update_comment_reply_count',
  'update_workout_rating_average',
  'update_workout_favorite_count',
  'update_follower_counts',
  'update_workout_view_count',
  'notify_on_new_follower',
  'notify_on_workout_like',
  'notify_on_new_comment'
)
ORDER BY routine_name;

-- Expected: 10 rows

-- ============================================

--  SUCCESS SUMMARY
-- If you see all checks passing, the migration was SUCCESSFUL! <‰