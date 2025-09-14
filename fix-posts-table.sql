-- Execute this in Supabase SQL Editor to ensure posts table has workout_id column
-- This fixes the auto-posts system by updating the posts table structure

-- Check if posts table exists and add missing columns
DO $$
BEGIN
  -- Ensure posts table exists with all required columns
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'posts'
  ) THEN
    
    -- Add workout_id column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'workout_id'
    ) THEN
      ALTER TABLE public.posts 
      ADD COLUMN workout_id uuid REFERENCES public.workouts;
      RAISE NOTICE 'Added workout_id column to posts table';
    ELSE
      RAISE NOTICE 'workout_id column already exists in posts table';
    END IF;
    
    -- Add achievement_id column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'achievement_id'
    ) THEN
      ALTER TABLE public.posts 
      ADD COLUMN achievement_id uuid REFERENCES public.badges;
      RAISE NOTICE 'Added achievement_id column to posts table';
    ELSE
      RAISE NOTICE 'achievement_id column already exists in posts table';
    END IF;
    
  ELSE
    -- Create posts table if it doesn't exist
    CREATE TABLE public.posts (
      id uuid default gen_random_uuid() primary key,
      user_id uuid references public.profiles on delete cascade not null,
      content text,
      media_url text[],
      type text not null check (type in ('workout', 'achievement', 'general')),
      workout_id uuid references public.workouts,
      achievement_id uuid references public.badges,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
      likes_count integer not null default 0,
      comments_count integer not null default 0,
      
      constraint post_type_validation check (
        (type = 'workout' and workout_id is not null and achievement_id is null) or
        (type = 'achievement' and achievement_id is not null and workout_id is null) or
        (type = 'general' and workout_id is null and achievement_id is null)
      )
    );
    
    -- Enable Row Level Security
    ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies
    CREATE POLICY "Posts are viewable by everyone"
      ON posts FOR SELECT
      USING (true);

    CREATE POLICY "Users can create posts"
      ON posts FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own posts"
      ON posts FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own posts"
      ON posts FOR DELETE
      USING (auth.uid() = user_id);
    
    RAISE NOTICE 'Created posts table with all required columns';
  END IF;
  
END $$;

-- Verify the posts table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'posts'
ORDER BY ordinal_position;