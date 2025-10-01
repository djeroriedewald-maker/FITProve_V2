-- Fix incorrect Event environment tagging
-- Only Hyrox exercises should have environment = 'Event'
-- This script will update all non-Hyrox exercises currently tagged as Event

UPDATE exercises
SET environment = 'Gym' -- or another correct value
WHERE environment = 'Event' AND name NOT ILIKE '%Hyrox%';

-- Optional: Review affected rows
-- SELECT id, name, environment FROM exercises WHERE environment = 'Event';
