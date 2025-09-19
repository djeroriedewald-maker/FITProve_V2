-- Migration: Fix user_badges table structure for badge awarding compatibility
-- This migration will drop and recreate the user_badges table with the correct columns.
-- WARNING: This will remove all existing user_badges data. Backup if needed!

DROP TABLE IF EXISTS public.user_badges CASCADE;

CREATE TABLE public.user_badges (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    achieved_at TIMESTAMP DEFAULT NOW(),
    note TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, badge_id)
);

-- Enable RLS and policies if needed
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
