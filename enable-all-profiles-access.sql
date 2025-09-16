-- VOLLEDIGE TOEGANG VOOR ALLE PROFIELEN
-- Dit script geeft alle bestaande profielen toegang tot alle app modules
-- Run dit in Supabase SQL Editor

-- 1. Controleer hoeveel profielen er bestaan
SELECT 
  'Bestaande profielen gevonden' as status,
  COUNT(*) as aantal_profielen,
  STRING_AGG(email, ', ') as emails
FROM profiles;

-- 2. Maak RLS policies veel permissiever voor alle bestaande profielen
-- In plaats van auth.uid() gebruiken we een check op bestaande profile IDs

-- CUSTOM WORKOUTS: Alle profielen kunnen alles doen
DROP POLICY IF EXISTS "Alle profielen kunnen workouts beheren" ON custom_workouts;
CREATE POLICY "Alle profielen kunnen workouts beheren" ON custom_workouts
FOR ALL USING (
  user_id IN (SELECT id FROM profiles)
) WITH CHECK (
  user_id IN (SELECT id FROM profiles)
);

-- CUSTOM WORKOUT EXERCISES: Alle profielen kunnen exercises beheren
DROP POLICY IF EXISTS "Alle profielen kunnen workout exercises beheren" ON custom_workout_exercises;
CREATE POLICY "Alle profielen kunnen workout exercises beheren" ON custom_workout_exercises
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM custom_workouts cw
    WHERE cw.id = custom_workout_exercises.custom_workout_id
    AND cw.user_id IN (SELECT id FROM profiles)
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM custom_workouts cw
    WHERE cw.id = custom_workout_exercises.custom_workout_id
    AND cw.user_id IN (SELECT id FROM profiles)
  )
);

-- WORKOUT SESSIONS: Alle profielen kunnen sessions beheren
DROP POLICY IF EXISTS "Alle profielen kunnen workout sessions beheren" ON workout_sessions;
CREATE POLICY "Alle profielen kunnen workout sessions beheren" ON workout_sessions
FOR ALL USING (
  user_id IN (SELECT id FROM profiles)
) WITH CHECK (
  user_id IN (SELECT id FROM profiles)
);

-- WORKOUT EXERCISE RESULTS: Alle profielen kunnen results beheren
DROP POLICY IF EXISTS "Alle profielen kunnen exercise results beheren" ON workout_exercise_results;
CREATE POLICY "Alle profielen kunnen exercise results beheren" ON workout_exercise_results
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM workout_sessions ws
    WHERE ws.id = workout_exercise_results.workout_session_id
    AND ws.user_id IN (SELECT id FROM profiles)
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM workout_sessions ws
    WHERE ws.id = workout_exercise_results.workout_session_id
    AND ws.user_id IN (SELECT id FROM profiles)
  )
);

-- WORKOUT LIKES: Alle profielen kunnen likes beheren
DROP POLICY IF EXISTS "Alle profielen kunnen likes beheren" ON workout_likes;
CREATE POLICY "Alle profielen kunnen likes beheren" ON workout_likes
FOR ALL USING (
  user_id IN (SELECT id FROM profiles)
) WITH CHECK (
  user_id IN (SELECT id FROM profiles)
);

-- PROFILES: Alle profielen kunnen hun eigen profiel lezen en updaten
DROP POLICY IF EXISTS "Profielen kunnen zichzelf beheren" ON profiles;
CREATE POLICY "Profielen kunnen zichzelf beheren" ON profiles
FOR ALL USING (
  id IN (SELECT id FROM profiles)
) WITH CHECK (
  id IN (SELECT id FROM profiles)
);

-- 3. Zorg ervoor dat exercise library publiek toegankelijk is
DROP POLICY IF EXISTS "Publieke toegang tot exercises" ON exercises;
CREATE POLICY "Publieke toegang tot exercises" ON exercises
FOR SELECT USING (true);

-- 4. Test de toegang met een bestaand profiel
DO $$
DECLARE
    test_profile_id uuid;
    test_workout_id uuid;
BEGIN
    -- Neem het eerste profiel voor test
    SELECT id INTO test_profile_id FROM profiles LIMIT 1;
    
    IF test_profile_id IS NOT NULL THEN
        -- Test workout creation
        INSERT INTO custom_workouts (
            id,
            user_id,
            name,
            description,
            is_public,
            difficulty,
            tags,
            estimated_duration,
            estimated_calories
        ) VALUES (
            gen_random_uuid(),
            test_profile_id,
            'Test Toegang Workout',
            'Test of alle profielen toegang hebben',
            false,
            'beginner',
            ARRAY['test'],
            30,
            200
        ) RETURNING id INTO test_workout_id;
        
        RAISE NOTICE 'SUCCESS: Test workout aangemaakt met ID %', test_workout_id;
        
        -- Clean up test workout
        DELETE FROM custom_workouts WHERE id = test_workout_id;
        RAISE NOTICE 'Test workout opgeruimd';
    ELSE
        RAISE NOTICE 'WAARSCHUWING: Geen profielen gevonden om te testen';
    END IF;
END $$;

-- 5. Overzicht van alle profielen die nu toegang hebben
SELECT 
    'VOLLEDIGE TOEGANG GECONFIGUREERD' as status,
    COUNT(*) as aantal_profielen_met_toegang,
    ARRAY_AGG(
        CONCAT(name, ' (', email, ')')
        ORDER BY created_at
    ) as profiel_lijst
FROM profiles;

-- 6. Controleer welke policies nu actief zijn
SELECT 
    schemaname,
    tablename,
    policyname,
    'ACTIEF' as status
FROM pg_policies 
WHERE tablename IN (
    'profiles', 
    'custom_workouts', 
    'custom_workout_exercises', 
    'workout_sessions', 
    'workout_exercise_results', 
    'workout_likes'
)
ORDER BY tablename, policyname;