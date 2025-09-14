-- Manual SQL to apply social features migration
-- Run this in your Supabase SQL Editor if the migration hasn't been applied

-- First, check if the posts table exists and has the type column
DO $$ 
BEGIN
    -- Check if type column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'type' 
        AND table_schema = 'public'
    ) THEN
        -- Add the type column if it doesn't exist
        ALTER TABLE public.posts ADD COLUMN type text;
        ALTER TABLE public.posts ADD CONSTRAINT posts_type_check CHECK (type IN ('workout', 'achievement', 'general'));
        ALTER TABLE public.posts ALTER COLUMN type SET NOT NULL;
        ALTER TABLE public.posts ALTER COLUMN type SET DEFAULT 'general';
        
        RAISE NOTICE 'Added type column to posts table';
    ELSE
        RAISE NOTICE 'Type column already exists in posts table';
    END IF;
END $$;

-- Ensure other required columns exist
DO $$ 
BEGIN
    -- Check and add media_url column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'media_url' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN media_url text[];
        RAISE NOTICE 'Added media_url column to posts table';
    END IF;

    -- Check and add likes_count column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'likes_count' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN likes_count integer NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added likes_count column to posts table';
    END IF;

    -- Check and add comments_count column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'comments_count' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN comments_count integer NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added comments_count column to posts table';
    END IF;
END $$;

-- Create comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  content text not null,
  parent_id uuid references public.comments on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  likes_count integer not null default 0,
  
  constraint content_not_empty check (length(trim(content)) > 0)
);

-- Create likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  post_id uuid references public.posts on delete cascade,
  comment_id uuid references public.comments on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint like_target_validation check (
    (post_id is not null and comment_id is null) or
    (comment_id is not null and post_id is null)
  ),
  unique (user_id, post_id),
  unique (user_id, comment_id)
);

-- Enable RLS on all tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for posts
CREATE POLICY "Posts are viewable by everyone" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for comments  
CREATE POLICY "Comments are viewable by everyone" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for likes
CREATE POLICY "Likes are viewable by everyone" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own likes" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_type ON public.posts(type);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);