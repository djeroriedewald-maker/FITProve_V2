-- ================================
-- UITVOEREN IN SUPABASE SQL EDITOR
-- ================================
-- 1. Ga naar https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn
-- 2. Klik op "SQL Editor" in het linkermenu
-- 3. Maak een nieuwe query en plak deze complete code erin
-- 4. Klik op "Run" om uit te voeren
-- ================================

-- STAP 1: CORRECTE RLS SETUP VOOR ALLE GEAUTHENTICEERDE GEBRUIKERS
-- Dit script geeft alle auth.users toegang tot alle modules met behoud van veiligheid

-- 1. PROFILES TABEL SETUP
-- Zorg ervoor dat profiles automatisch worden aangemaakt voor auth users
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop oude policies
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON profiles;

-- Nieuwe profiles policies: iedereen kan profielen lezen, alleen eigen profiel updaten
CREATE POLICY "Authenticated users can read all profiles" ON profiles
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- 2. AUTOMATISCHE PROFILE CREATIE FUNCTIE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.created_at,
    new.updated_at
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TRIGGER VOOR AUTOMATISCHE PROFILE CREATIE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. WORKOUT TABLES - ALLE GEAUTHENTICEERDE GEBRUIKERS HEBBEN TOEGANG
ALTER TABLE custom_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercise_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_likes ENABLE ROW LEVEL SECURITY;

-- Custom Workouts: Alle geauthenticeerde gebruikers kunnen alles
DROP POLICY IF EXISTS "Authenticated users full access workouts" ON custom_workouts;
CREATE POLICY "Authenticated users full access workouts" ON custom_workouts
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Custom Workout Exercises: Alle geauthenticeerde gebruikers kunnen alles
DROP POLICY IF EXISTS "Authenticated users full access workout exercises" ON custom_workout_exercises;
CREATE POLICY "Authenticated users full access workout exercises" ON custom_workout_exercises
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Workout Sessions: Alle geauthenticeerde gebruikers kunnen alles
DROP POLICY IF EXISTS "Authenticated users full access sessions" ON workout_sessions;
CREATE POLICY "Authenticated users full access sessions" ON workout_sessions
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Workout Exercise Results: Alle geauthenticeerde gebruikers kunnen alles
DROP POLICY IF EXISTS "Authenticated users full access results" ON workout_exercise_results;
CREATE POLICY "Authenticated users full access results" ON workout_exercise_results
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Workout Likes: Alle geauthenticeerde gebruikers kunnen alles
DROP POLICY IF EXISTS "Authenticated users full access likes" ON workout_likes;
CREATE POLICY "Authenticated users full access likes" ON workout_likes
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 5. EXERCISES TABEL - PUBLIEK LEESBAAR
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access to exercises" ON exercises;
CREATE POLICY "Public read access to exercises" ON exercises
FOR SELECT USING (true);

-- 6. BESTAANDE AUTH USERS SYNCHRONISEREN MET PROFILES
-- Voor alle bestaande auth users, maak profiles aan als ze nog niet bestaan
INSERT INTO profiles (id, email, name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  au.created_at,
  au.updated_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = au.id
)
AND au.email_confirmed_at IS NOT NULL;

-- 7. VERIFICATIE - RESULTATEN WEERGEVEN
SELECT 
  'SETUP VOLTOOID' as status,
  (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) as auth_users_confirmed,
  (SELECT COUNT(*) FROM profiles) as profiles_created,
  'Alle geauthenticeerde gebruikers hebben nu toegang tot alle modules' as message;

-- 8. TOON ALLE POLICIES VOOR VERIFICATIE
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN cmd = 'ALL' THEN 'Volledige toegang'
    WHEN cmd = 'SELECT' THEN 'Lezen'
    WHEN cmd = 'INSERT' THEN 'Aanmaken'
    WHEN cmd = 'UPDATE' THEN 'Updaten'
    WHEN cmd = 'DELETE' THEN 'Verwijderen'
  END as toegang_type
FROM pg_policies 
WHERE tablename IN ('profiles', 'custom_workouts', 'custom_workout_exercises', 'workout_sessions', 'workout_exercise_results', 'workout_likes', 'exercises')
ORDER BY tablename, policyname;

-- ================================
-- KLAAR! 
-- Na het uitvoeren van dit script:
-- 1. Refresh je browser (F5)
-- 2. Test Save Workout en Start Workout
-- 3. Check of alle functies werken
-- ================================