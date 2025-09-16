-- Add this migration to add a live counter for created workouts
-- You can run this SQL in Supabase to test the count query
SELECT COUNT(*) AS created_workouts FROM workouts;