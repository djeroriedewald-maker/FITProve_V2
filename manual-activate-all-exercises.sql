-- Migration: Make all exercises active and approved
-- This will update all exercises that are not currently visible in the app

UPDATE exercises
SET is_active = true,
    approval_status = 'approved'
WHERE is_active = false OR approval_status != 'approved';

-- Optional: Review affected rows
-- SELECT id, name FROM exercises WHERE is_active = true AND approval_status = 'approved';
