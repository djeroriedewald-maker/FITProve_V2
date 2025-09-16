-- CHECK CUSTOM_WORKOUTS TABLE SCHEMA
-- Run dit in Supabase SQL Editor om te zien welke kolommen bestaan

-- 1. Show all columns in custom_workouts table
SELECT 
  'CUSTOM_WORKOUTS COLUMNS' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'custom_workouts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Show table structure
SELECT 
  'TABLE INFO' as check_type,
  table_name,
  table_type,
  CASE WHEN table_name = 'custom_workouts' THEN '✅ EXISTS' ELSE '❌ NOT FOUND' END as status
FROM information_schema.tables 
WHERE table_name = 'custom_workouts' 
AND table_schema = 'public';

-- 3. Check if we need to add missing columns
SELECT 
  'MISSING COLUMNS CHECK' as check_type,
  'These columns might be missing and causing the error:' as note,
  'difficulty, tags, hero_image_url' as potentially_missing;

-- 4. Sample data from table (if any exists)
SELECT 
  'SAMPLE DATA' as check_type,
  COUNT(*) as total_records,
  CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE 'ℹ️ EMPTY TABLE' END as data_status
FROM custom_workouts;