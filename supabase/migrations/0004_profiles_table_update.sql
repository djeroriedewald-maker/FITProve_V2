-- Update profiles table structure
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Drop and recreate the profiles table with the new schema
-- Drop dependent tables first to avoid constraint issues
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS followers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Recreate the profiles table
CREATE TABLE profiles (
    id uuid NOT NULL PRIMARY KEY,
    email text,
    name text,
    display_name text,
    username text,
    bio text,
    avatar_url text,
    fitness_goals text[] DEFAULT '{}'::text[],
    level integer DEFAULT 1,
    stats jsonb DEFAULT '{"streakDays": 0, "totalMinutes": 0, "followersCount": 0, "followingCount": 0, "achievementsCount": 0, "workoutsCompleted": 0}'::jsonb,
    achievements jsonb[] DEFAULT '{}'::jsonb[],
    recent_workouts jsonb[] DEFAULT '{}'::jsonb[],
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create trigger for updating the updated_at timestamp
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);

-- Add RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read any profile
CREATE POLICY read_all_profiles ON profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy to allow users to update only their own profile
CREATE POLICY update_own_profile ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy to allow users to delete their own profile
CREATE POLICY delete_own_profile ON profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

-- Policy to allow profile creation only for the authenticated user's own profile
CREATE POLICY insert_own_profile ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Recreate dependent tables
CREATE TABLE sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE user_badges (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    badge_name text NOT NULL,
    awarded_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE posts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE comments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE likes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    UNIQUE(post_id, user_id)
);

CREATE TABLE followers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    following_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    UNIQUE(follower_id, following_id)
);

-- Add RLS policies for dependent tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY read_own_sessions ON sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY manage_own_sessions ON sessions FOR ALL TO authenticated USING (auth.uid() = user_id);

-- User badges policies
CREATE POLICY read_all_badges ON user_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY manage_own_badges ON user_badges FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY read_all_posts ON posts FOR SELECT TO authenticated USING (true);
CREATE POLICY manage_own_posts ON posts FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY read_all_comments ON comments FOR SELECT TO authenticated USING (true);
CREATE POLICY manage_own_comments ON comments FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY read_all_likes ON likes FOR SELECT TO authenticated USING (true);
CREATE POLICY manage_own_likes ON likes FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Followers policies
CREATE POLICY read_all_followers ON followers FOR SELECT TO authenticated USING (true);
CREATE POLICY manage_own_following ON followers FOR ALL TO authenticated USING (auth.uid() = follower_id);