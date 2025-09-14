-- Add reaction types to likes table
-- This migration adds support for different reaction types instead of just binary likes

-- Add reaction_type column to likes table
ALTER TABLE public.likes 
ADD COLUMN IF NOT EXISTS reaction_type text DEFAULT 'like';

-- Add constraint for valid reaction types
ALTER TABLE public.likes 
ADD CONSTRAINT likes_reaction_type_check 
CHECK (reaction_type IN ('like', 'love', 'fire', 'strong'));

-- Update existing likes to use 'like' as default reaction type
UPDATE public.likes 
SET reaction_type = 'like' 
WHERE reaction_type IS NULL;

-- Make reaction_type not null
ALTER TABLE public.likes 
ALTER COLUMN reaction_type SET NOT NULL;

-- Create index for better performance on reaction queries
CREATE INDEX IF NOT EXISTS idx_likes_reaction_type ON public.likes(reaction_type);

-- Update the unique constraints to include reaction_type
-- This allows users to have multiple reactions on the same post/comment
ALTER TABLE public.likes 
DROP CONSTRAINT IF EXISTS likes_user_id_post_id_key;

ALTER TABLE public.likes 
DROP CONSTRAINT IF EXISTS likes_user_id_comment_id_key;

-- Add new composite unique constraints including reaction_type
ALTER TABLE public.likes 
ADD CONSTRAINT likes_user_post_reaction_unique 
UNIQUE (user_id, post_id, reaction_type);

ALTER TABLE public.likes 
ADD CONSTRAINT likes_user_comment_reaction_unique 
UNIQUE (user_id, comment_id, reaction_type);

-- But ensure users can only have ONE reaction per post/comment
-- We'll handle this in application logic by removing existing reactions before adding new ones