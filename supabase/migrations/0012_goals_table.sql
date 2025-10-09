-- Create goals table for workout goal tracking
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT NOT NULL,
  deadline TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  CONSTRAINT goals_status_check CHECK (status IN ('active', 'completed', 'abandoned', 'paused')),
  CONSTRAINT goals_type_check CHECK (type IN ('workouts_per_week', 'workout_minutes', 'weight_loss', 'weight_gain', 'strength_increase', 'streak_days', 'calories_burned', 'custom'))
);

-- Create index for user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- Create index for status for filtering active goals
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);

-- Create index for created_at for sorting
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON goals(created_at DESC);

-- Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Policy: Users can view their own goals
CREATE POLICY "Users can view their own goals"
  ON goals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own goals
CREATE POLICY "Users can insert their own goals"
  ON goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own goals
CREATE POLICY "Users can update their own goals"
  ON goals
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own goals
CREATE POLICY "Users can delete their own goals"
  ON goals
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER goals_updated_at_trigger
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_goals_updated_at();

-- Add comment to table
COMMENT ON TABLE goals IS 'Stores user fitness goals for tracking progress';
