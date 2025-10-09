-- Create workout_templates table
CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,

  -- Generator preferences
  preferences JSONB NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  use_count INTEGER DEFAULT 0,

  -- Tags for filtering
  tags TEXT[] DEFAULT '{}',

  CONSTRAINT workout_templates_name_check CHECK (char_length(name) > 0 AND char_length(name) <= 100)
);

-- Create index for user queries
CREATE INDEX IF NOT EXISTS workout_templates_user_id_idx ON workout_templates(user_id);
CREATE INDEX IF NOT EXISTS workout_templates_created_at_idx ON workout_templates(created_at DESC);

-- Enable RLS
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own templates"
  ON workout_templates
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
  ON workout_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON workout_templates
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON workout_templates
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_workout_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER workout_templates_updated_at
  BEFORE UPDATE ON workout_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_workout_templates_updated_at();

-- Add comments for documentation
COMMENT ON TABLE workout_templates IS 'Stores user workout generator preferences as reusable templates';
COMMENT ON COLUMN workout_templates.preferences IS 'JSON object containing all generator preferences (goal, duration, frequency, equipment, etc.)';
COMMENT ON COLUMN workout_templates.use_count IS 'Number of times this template has been used';
COMMENT ON COLUMN workout_templates.last_used_at IS 'Timestamp of last template usage';
