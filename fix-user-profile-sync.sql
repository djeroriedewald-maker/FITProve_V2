-- Create automatic profile creation trigger for new auth users
-- This ensures that every new user gets a profile automatically

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    display_name,
    username,
    bio,
    avatar_url,
    fitness_goals,
    level,
    stats
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    SPLIT_PART(NEW.email, '@', 1),
    '',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    '{}',
    1,
    JSON_BUILD_OBJECT(
      'workoutsCompleted', 0,
      'totalMinutes', 0,
      'streakDays', 0,
      'achievementsCount', 0,
      'followersCount', 0,
      'followingCount', 0
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sync existing auth users who don't have profiles
INSERT INTO public.profiles (
  id,
  email,
  name,
  display_name,
  username,
  bio,
  avatar_url,
  fitness_goals,
  level,
  stats
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  SPLIT_PART(u.email, '@', 1),
  '',
  COALESCE(u.raw_user_meta_data->>'avatar_url', ''),
  '{}',
  1,
  JSON_BUILD_OBJECT(
    'workoutsCompleted', 0,
    'totalMinutes', 0,
    'streakDays', 0,
    'achievementsCount', 0,
    'followersCount', 0,
    'followingCount', 0
  )
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles)
  AND u.email IS NOT NULL
  AND u.email_confirmed_at IS NOT NULL;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;