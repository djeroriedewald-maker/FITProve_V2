-- Migration: Complete Social Features (Comments, Ratings, Favorites, Follows, Notifications)
-- Description: Adds all necessary tables and functions for a full social fitness platform

-- ============================================
-- 1. WORKOUT COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workout_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_workout_id UUID NOT NULL REFERENCES custom_workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES workout_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_workout_comments_workout ON workout_comments(custom_workout_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_comments_user ON workout_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_comments_parent ON workout_comments(parent_comment_id);

-- RLS for comments
ALTER TABLE workout_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments on public workouts"
  ON workout_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM custom_workouts
      WHERE id = workout_comments.custom_workout_id
      AND is_public = true
    )
  );

CREATE POLICY "Users can create comments"
  ON workout_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON workout_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON workout_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. COMMENT LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES workout_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Index for comment likes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON comment_likes(user_id);

-- RLS for comment likes
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comment likes"
  ON comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like comments"
  ON comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. WORKOUT RATINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workout_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_workout_id UUID NOT NULL REFERENCES custom_workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(custom_workout_id, user_id),
  CONSTRAINT review_length CHECK (review IS NULL OR char_length(review) <= 1000)
);

-- Index for ratings
CREATE INDEX IF NOT EXISTS idx_workout_ratings_workout ON workout_ratings(custom_workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_ratings_user ON workout_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_ratings_rating ON workout_ratings(rating DESC);

-- RLS for ratings
ALTER TABLE workout_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings on public workouts"
  ON workout_ratings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM custom_workouts
      WHERE id = workout_ratings.custom_workout_id
      AND is_public = true
    )
  );

CREATE POLICY "Users can create ratings"
  ON workout_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON workout_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON workout_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Add rating columns to custom_workouts if they don't exist
DO $$ BEGIN
  ALTER TABLE custom_workouts ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;
  ALTER TABLE custom_workouts ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- ============================================
-- 4. WORKOUT FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workout_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_workout_id UUID NOT NULL REFERENCES custom_workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(custom_workout_id, user_id),
  CONSTRAINT notes_length CHECK (notes IS NULL OR char_length(notes) <= 500)
);

-- Index for favorites
CREATE INDEX IF NOT EXISTS idx_workout_favorites_user ON workout_favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_favorites_workout ON workout_favorites(custom_workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_favorites_collection ON workout_favorites(user_id, collection_name);

-- RLS for favorites
ALTER TABLE workout_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON workout_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create favorites"
  ON workout_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favorites"
  ON workout_favorites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON workout_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Add favorite_count to custom_workouts if it doesn't exist
DO $$ BEGIN
  ALTER TABLE custom_workouts ADD COLUMN IF NOT EXISTS favorite_count INTEGER DEFAULT 0;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- ============================================
-- 5. USER FOLLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Index for follows
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- RLS for follows
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows"
  ON user_follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others"
  ON user_follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Add follower counts to profiles if they don't exist
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS workout_count INTEGER DEFAULT 0;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- ============================================
-- 6. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follow', 'like', 'comment', 'rating', 'featured', 'milestone')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  related_workout_id UUID REFERENCES custom_workouts(id) ON DELETE CASCADE,
  related_comment_id UUID REFERENCES workout_comments(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT message_length CHECK (char_length(message) >= 1 AND char_length(message) <= 500)
);

-- Index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. VIEW COUNT TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS workout_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_workout_id UUID NOT NULL REFERENCES custom_workouts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for views
CREATE INDEX IF NOT EXISTS idx_workout_views_workout ON workout_views(custom_workout_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_views_user ON workout_views(user_id);

-- RLS for views
ALTER TABLE workout_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record workout views"
  ON workout_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view workout views"
  ON workout_views FOR SELECT
  USING (true);

-- Add view_count to custom_workouts if it doesn't exist
DO $$ BEGIN
  ALTER TABLE custom_workouts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- ============================================
-- 8. TRIGGERS FOR AUTOMATIC COUNTING
-- ============================================

-- Function to update comment like count
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE workout_comments
    SET like_count = like_count + 1
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE workout_comments
    SET like_count = GREATEST(0, like_count - 1)
    WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comment_like_count_trigger ON comment_likes;
CREATE TRIGGER comment_like_count_trigger
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_like_count();

-- Function to update comment reply count
CREATE OR REPLACE FUNCTION update_comment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_comment_id IS NOT NULL THEN
    UPDATE workout_comments
    SET reply_count = reply_count + 1
    WHERE id = NEW.parent_comment_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_comment_id IS NOT NULL THEN
    UPDATE workout_comments
    SET reply_count = GREATEST(0, reply_count - 1)
    WHERE id = OLD.parent_comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comment_reply_count_trigger ON workout_comments;
CREATE TRIGGER comment_reply_count_trigger
  AFTER INSERT OR DELETE ON workout_comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_reply_count();

-- Function to update workout rating average
CREATE OR REPLACE FUNCTION update_workout_rating_average()
RETURNS TRIGGER AS $$
DECLARE
  workout_id UUID;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    workout_id := NEW.custom_workout_id;
  ELSE
    workout_id := OLD.custom_workout_id;
  END IF;

  UPDATE custom_workouts
  SET
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM workout_ratings
      WHERE custom_workout_id = workout_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM workout_ratings
      WHERE custom_workout_id = workout_id
    )
  WHERE id = workout_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS workout_rating_average_trigger ON workout_ratings;
CREATE TRIGGER workout_rating_average_trigger
  AFTER INSERT OR UPDATE OR DELETE ON workout_ratings
  FOR EACH ROW EXECUTE FUNCTION update_workout_rating_average();

-- Function to update favorite count
CREATE OR REPLACE FUNCTION update_workout_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE custom_workouts
    SET favorite_count = favorite_count + 1
    WHERE id = NEW.custom_workout_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE custom_workouts
    SET favorite_count = GREATEST(0, favorite_count - 1)
    WHERE id = OLD.custom_workout_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS workout_favorite_count_trigger ON workout_favorites;
CREATE TRIGGER workout_favorite_count_trigger
  AFTER INSERT OR DELETE ON workout_favorites
  FOR EACH ROW EXECUTE FUNCTION update_workout_favorite_count();

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles
    SET follower_count = follower_count + 1
    WHERE id = NEW.following_id;

    UPDATE profiles
    SET following_count = following_count + 1
    WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET follower_count = GREATEST(0, follower_count - 1)
    WHERE id = OLD.following_id;

    UPDATE profiles
    SET following_count = GREATEST(0, following_count - 1)
    WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS follower_counts_trigger ON user_follows;
CREATE TRIGGER follower_counts_trigger
  AFTER INSERT OR DELETE ON user_follows
  FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

-- Function to update view count
CREATE OR REPLACE FUNCTION update_workout_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE custom_workouts
  SET view_count = view_count + 1
  WHERE id = NEW.custom_workout_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS workout_view_count_trigger ON workout_views;
CREATE TRIGGER workout_view_count_trigger
  AFTER INSERT ON workout_views
  FOR EACH ROW EXECUTE FUNCTION update_workout_view_count();

-- ============================================
-- 9. NOTIFICATION HELPER FUNCTIONS
-- ============================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_actor_id UUID DEFAULT NULL,
  p_related_workout_id UUID DEFAULT NULL,
  p_related_comment_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, message, action_url, actor_id,
    related_workout_id, related_comment_id
  )
  VALUES (
    p_user_id, p_type, p_title, p_message, p_action_url, p_actor_id,
    p_related_workout_id, p_related_comment_id
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-create notifications for new followers
CREATE OR REPLACE FUNCTION notify_on_new_follower()
RETURNS TRIGGER AS $$
DECLARE
  follower_name TEXT;
BEGIN
  SELECT display_name INTO follower_name
  FROM profiles
  WHERE id = NEW.follower_id;

  PERFORM create_notification(
    NEW.following_id,
    'follow',
    'New Follower!',
    follower_name || ' started following you',
    '/profile/' || NEW.follower_id,
    NEW.follower_id,
    NULL,
    NULL
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS new_follower_notification_trigger ON user_follows;
CREATE TRIGGER new_follower_notification_trigger
  AFTER INSERT ON user_follows
  FOR EACH ROW EXECUTE FUNCTION notify_on_new_follower();

-- Function to auto-create notifications for new workout likes
CREATE OR REPLACE FUNCTION notify_on_workout_like()
RETURNS TRIGGER AS $$
DECLARE
  liker_name TEXT;
  workout_owner UUID;
  workout_name TEXT;
BEGIN
  -- Get workout owner and name
  SELECT user_id, name INTO workout_owner, workout_name
  FROM custom_workouts
  WHERE id = NEW.custom_workout_id;

  -- Don't notify if user likes their own workout
  IF NEW.user_id = workout_owner THEN
    RETURN NULL;
  END IF;

  -- Get liker's name
  SELECT display_name INTO liker_name
  FROM profiles
  WHERE id = NEW.user_id;

  PERFORM create_notification(
    workout_owner,
    'like',
    'Workout Liked!',
    liker_name || ' liked your workout "' || workout_name || '"',
    '/community/workout/' || NEW.custom_workout_id,
    NEW.user_id,
    NEW.custom_workout_id,
    NULL
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS workout_like_notification_trigger ON workout_likes;
CREATE TRIGGER workout_like_notification_trigger
  AFTER INSERT ON workout_likes
  FOR EACH ROW EXECUTE FUNCTION notify_on_workout_like();

-- Function to auto-create notifications for new comments
CREATE OR REPLACE FUNCTION notify_on_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  commenter_name TEXT;
  workout_owner UUID;
  workout_name TEXT;
BEGIN
  -- Get workout owner and name
  SELECT user_id, name INTO workout_owner, workout_name
  FROM custom_workouts
  WHERE id = NEW.custom_workout_id;

  -- Don't notify if user comments on their own workout
  IF NEW.user_id = workout_owner THEN
    RETURN NULL;
  END IF;

  -- Get commenter's name
  SELECT display_name INTO commenter_name
  FROM profiles
  WHERE id = NEW.user_id;

  PERFORM create_notification(
    workout_owner,
    'comment',
    'New Comment!',
    commenter_name || ' commented on "' || workout_name || '"',
    '/community/workout/' || NEW.custom_workout_id,
    NEW.user_id,
    NEW.custom_workout_id,
    NEW.id
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS new_comment_notification_trigger ON workout_comments;
CREATE TRIGGER new_comment_notification_trigger
  AFTER INSERT ON workout_comments
  FOR EACH ROW EXECUTE FUNCTION notify_on_new_comment();

-- ============================================
-- 10. USEFUL VIEWS
-- ============================================

-- View for popular workouts (trending)
CREATE OR REPLACE VIEW popular_workouts AS
SELECT
  cw.*,
  p.display_name as creator_name,
  p.username as creator_username,
  p.avatar_url as creator_avatar,
  (cw.like_count * 2 + cw.use_count * 3 + cw.view_count * 1 + cw.favorite_count * 4) as popularity_score
FROM custom_workouts cw
LEFT JOIN profiles p ON cw.user_id = p.id
WHERE cw.is_public = true
ORDER BY popularity_score DESC;

-- View for user activity feed
CREATE OR REPLACE VIEW user_activity_feed AS
SELECT
  'workout_created' as activity_type,
  cw.id as activity_id,
  cw.user_id,
  cw.name as title,
  cw.description as description,
  cw.created_at,
  p.display_name as user_name,
  p.username as username,
  p.avatar_url as user_avatar
FROM custom_workouts cw
LEFT JOIN profiles p ON cw.user_id = p.id
WHERE cw.is_public = true
UNION ALL
SELECT
  'comment_added' as activity_type,
  wc.id as activity_id,
  wc.user_id,
  'Commented on workout' as title,
  wc.content as description,
  wc.created_at,
  p.display_name as user_name,
  p.username as username,
  p.avatar_url as user_avatar
FROM workout_comments wc
LEFT JOIN profiles p ON wc.user_id = p.id
ORDER BY created_at DESC;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================