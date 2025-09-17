-- Add privacy and follow fields to user profile table
ALTER TABLE profiles
ADD COLUMN is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN allow_follow BOOLEAN DEFAULT FALSE;

-- Create follows table for follow relationships
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  followed_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (follower_id, followed_id)
);

-- Indexes for efficient search
CREATE INDEX idx_profiles_username ON profiles (username);
CREATE INDEX idx_profiles_email ON profiles (email);
CREATE INDEX idx_profiles_display_name ON profiles (display_name);
CREATE INDEX idx_follows_follower_id ON follows (follower_id);
CREATE INDEX idx_follows_followed_id ON follows (followed_id);