-- Execute this in Supabase SQL Editor to create notifications system
-- This will create the notifications table and related functions

-- Step 1: Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('like', 'comment', 'mention', 'follow', 'achievement')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Optional references to related entities
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  from_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;

-- Step 3: Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- System can insert notifications for any user
CREATE POLICY "System can insert notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (true);

-- Step 5: Create function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}',
  p_post_id uuid DEFAULT NULL,
  p_comment_id uuid DEFAULT NULL,
  p_from_user_id uuid DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (
    user_id, type, title, message, data, post_id, comment_id, from_user_id
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_data, p_post_id, p_comment_id, p_from_user_id
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create function to mark notifications as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.notifications 
  SET read = true 
  WHERE id = notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS void AS $$
BEGIN
  UPDATE public.notifications 
  SET read = true 
  WHERE user_id = auth.uid() AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create function to get unread count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer 
    FROM public.notifications 
    WHERE user_id = auth.uid() AND read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create triggers for automatic notifications
-- Trigger for new likes
CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS trigger AS $$
DECLARE
  post_author_id uuid;
  liker_name text;
  post_content_preview text;
BEGIN
  -- Get post author and liker info
  SELECT p.user_id, pr.name, LEFT(p.content, 50)
  INTO post_author_id, liker_name, post_content_preview
  FROM public.posts p
  LEFT JOIN public.profiles pr ON pr.id = NEW.user_id
  WHERE p.id = NEW.post_id;
  
  -- Don't notify if user likes their own post
  IF post_author_id != NEW.user_id THEN
    PERFORM public.create_notification(
      post_author_id,
      'like',
      'Nieuwe reactie op je post',
      COALESCE(liker_name, 'Iemand') || ' heeft gereageerd op je post: "' || COALESCE(post_content_preview, '') || '"',
      jsonb_build_object('reaction_type', NEW.reaction_type),
      NEW.post_id,
      NULL,
      NEW.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for likes
DROP TRIGGER IF EXISTS trigger_notify_on_like ON public.likes;
CREATE TRIGGER trigger_notify_on_like
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();

-- Trigger for new comments
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger AS $$
DECLARE
  post_author_id uuid;
  parent_author_id uuid;
  commenter_name text;
  post_content_preview text;
BEGIN
  -- Get commenter info
  SELECT name INTO commenter_name 
  FROM public.profiles WHERE id = NEW.user_id;
  
  -- Get post author and content
  SELECT p.user_id, LEFT(p.content, 50)
  INTO post_author_id, post_content_preview
  FROM public.posts p WHERE p.id = NEW.post_id;
  
  -- Notify post author (if not self-comment)
  IF post_author_id != NEW.user_id THEN
    PERFORM public.create_notification(
      post_author_id,
      'comment',
      'Nieuwe reactie op je post',
      COALESCE(commenter_name, 'Iemand') || ' heeft gereageerd op je post: "' || COALESCE(post_content_preview, '') || '"',
      jsonb_build_object('comment_preview', LEFT(NEW.content, 100)),
      NEW.post_id,
      NEW.id,
      NEW.user_id
    );
  END IF;
  
  -- If this is a reply, also notify the parent comment author
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO parent_author_id 
    FROM public.comments WHERE id = NEW.parent_id;
    
    -- Don't duplicate notifications or notify self
    IF parent_author_id != NEW.user_id AND parent_author_id != post_author_id THEN
      PERFORM public.create_notification(
        parent_author_id,
        'comment',
        'Reactie op je opmerking',
        COALESCE(commenter_name, 'Iemand') || ' heeft gereageerd op je opmerking',
        jsonb_build_object('comment_preview', LEFT(NEW.content, 100)),
        NEW.post_id,
        NEW.id,
        NEW.user_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for comments
DROP TRIGGER IF EXISTS trigger_notify_on_comment ON public.comments;
CREATE TRIGGER trigger_notify_on_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- Final verification: Check the created table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public'
ORDER BY ordinal_position;