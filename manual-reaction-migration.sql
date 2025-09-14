-- Execute this in Supabase SQL Editor to add reaction support
-- This will update the likes table to support different reaction types

-- Step 1: Check current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'likes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Add reaction_type column with default value
ALTER TABLE public.likes 
ADD COLUMN IF NOT EXISTS reaction_type text DEFAULT 'like';

-- Step 3: Add constraint for valid reaction types
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_reaction_type_check;
    
    -- Add new constraint
    ALTER TABLE public.likes 
    ADD CONSTRAINT likes_reaction_type_check 
    CHECK (reaction_type IN ('like', 'love', 'fire', 'strong'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Step 4: Update existing likes to use 'like' as default reaction type
UPDATE public.likes 
SET reaction_type = 'like' 
WHERE reaction_type IS NULL;

-- Step 5: Make reaction_type not null
ALTER TABLE public.likes 
ALTER COLUMN reaction_type SET NOT NULL;

-- Step 6: Create indexes for better performance on reaction queries
CREATE INDEX IF NOT EXISTS idx_likes_reaction_type ON public.likes(reaction_type);
CREATE INDEX IF NOT EXISTS idx_likes_post_reaction ON public.likes(post_id, reaction_type);
CREATE INDEX IF NOT EXISTS idx_likes_user_post ON public.likes(user_id, post_id);

-- Step 7: Only update unique constraints if comment_id column exists
DO $$
BEGIN
    -- Check if comment_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'likes' 
        AND column_name = 'comment_id' 
        AND table_schema = 'public'
    ) THEN
        -- Drop old unique constraints if they exist
        ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_post_id_key;
        ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_comment_id_key;
        ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_post_unique;
        ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_comment_unique;
        
        -- Add new unique constraints
        ALTER TABLE public.likes 
        ADD CONSTRAINT likes_user_post_unique 
        UNIQUE (user_id, post_id);
        
        ALTER TABLE public.likes 
        ADD CONSTRAINT likes_user_comment_unique 
        UNIQUE (user_id, comment_id);
    ELSE
        -- Only post constraints if comment_id doesn't exist
        ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_post_id_key;
        ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_post_unique;
        
        ALTER TABLE public.likes 
        ADD CONSTRAINT likes_user_post_unique 
        UNIQUE (user_id, post_id);
    END IF;
END $$;

-- Final verification: Check the updated table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'likes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show all constraints on the likes table
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'likes' 
AND table_schema = 'public';