-- =====================================================
-- Migration: Fix Notifications Read Column
-- Description: Ensures the 'read' column exists in notifications table
-- =====================================================

-- Add the 'read' column if it doesn't exist
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

-- Create index for better performance on unread queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
ON notifications(user_id, read, created_at DESC);