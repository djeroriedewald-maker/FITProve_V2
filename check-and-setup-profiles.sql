-- STAP 1: RLS uitschakelen om bestaande profielen te kunnen zien
-- Run dit eerst in Supabase SQL Editor

-- Disable RLS op profiles table zodat we kunnen zien wat er bestaat
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Controleer hoeveel profielen er bestaan
SELECT 
  COUNT(*) as total_profiles,
  'Profielen gevonden na RLS disable' as status
FROM profiles;

-- Toon alle bestaande profielen
SELECT 
  id,
  email,
  name,
  display_name,
  username,
  created_at,
  'Bestaand profiel' as type
FROM profiles
ORDER BY created_at;

-- Als er nog geen profielen zijn, maak er een paar aan
INSERT INTO profiles (
  id,
  email,
  name,
  display_name,
  username,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  'demo' || generate_series || '@fitprove.com',
  'Demo User ' || generate_series,
  'Demo User ' || generate_series,
  'demo' || generate_series,
  now(),
  now()
FROM generate_series(1, 3)
WHERE NOT EXISTS (SELECT 1 FROM profiles LIMIT 1);

-- Finale check
SELECT 
  COUNT(*) as finale_count,
  'Profielen klaar voor gebruik' as status
FROM profiles;