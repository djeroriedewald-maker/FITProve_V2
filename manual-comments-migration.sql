-- Execute this in Supabase SQL Editor to add parent_id support for nested comments
-- This will update the comments table to support reply functionality

-- Step 1: Check current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'comments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Add parent_id column if it doesn't exist
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS parent_id uuid;

-- Step 3: Add foreign key constraint for parent_id
DO $$ 
BEGIN
    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_parent_id_fkey' 
        AND table_name = 'comments'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.comments 
        ADD CONSTRAINT comments_parent_id_fkey 
        FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 4: Create index for better performance on parent_id queries
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_parent ON public.comments(post_id, parent_id);

-- Step 5: Update any existing NULL parent_id values (should be none, but just in case)
-- No action needed as NULL is valid for root comments

-- Final verification: Check the updated table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'comments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show all constraints on the comments table
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'comments' 
AND table_schema = 'public';