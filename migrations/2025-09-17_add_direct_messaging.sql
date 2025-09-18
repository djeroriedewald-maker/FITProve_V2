-- Migration: Add direct messaging support
ALTER TABLE profiles
ADD COLUMN allow_direct_messages BOOLEAN DEFAULT FALSE;

CREATE TABLE direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  -- Only allow if both users follow each other and both have allow_direct_messages = TRUE
  CHECK (sender_id <> recipient_id)
);

CREATE INDEX idx_direct_messages_sender_id ON direct_messages (sender_id);
CREATE INDEX idx_direct_messages_recipient_id ON direct_messages (recipient_id);
