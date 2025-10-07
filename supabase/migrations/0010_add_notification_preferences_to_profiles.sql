-- Migration: Add notification_preferences to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"events": ["in_app"], "todos": ["in_app"]}';

-- Allow users to update their own notification_preferences
-- (RLS already allows update on own profile)

-- Optionally, update trigger to touch updated_at
-- (already handled by existing triggers)
