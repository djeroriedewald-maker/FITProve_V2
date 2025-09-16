-- =====================================================
-- FIX WORKOUTS TABLE RLS POLICIES
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- 1. Drop existing policies if they exist
DROP POLICY IF EXISTS "workouts_insert_policy" ON workouts;
DROP POLICY IF EXISTS "workouts_select_policy" ON workouts;
DROP POLICY IF EXISTS "workouts_update_policy" ON workouts;
DROP POLICY IF EXISTS "workouts_delete_policy" ON workouts;

-- 2. Enable RLS (should already be enabled)
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- 3. Create permissive policies for all authenticated users
-- Allow all authenticated users to read all workouts
CREATE POLICY "workouts_select_policy" ON workouts
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow all authenticated users to insert workouts
CREATE POLICY "workouts_insert_policy" ON workouts
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow all authenticated users to update workouts (for now)
CREATE POLICY "workouts_update_policy" ON workouts
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow all authenticated users to delete workouts (for now)
CREATE POLICY "workouts_delete_policy" ON workouts
    FOR DELETE
    TO authenticated
    USING (true);

-- 4. Verify the policies were created
SELECT 
    pol.polname as policy_name,
    pol.polcmd as policy_command,
    pol.polroles::regrole[] as policy_roles,
    pol.polqual as policy_using,
    pol.polwithcheck as policy_with_check
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
WHERE pc.relname = 'workouts'
ORDER BY pol.polname;