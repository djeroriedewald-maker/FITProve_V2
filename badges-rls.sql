-- RLS voor badges: publiek leesbaar
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access to badges" ON badges
  FOR SELECT USING (true);

-- RLS voor user_badges: alleen eigenaar mag lezen/schrijven
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own badges" ON user_badges
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own badges" ON user_badges
  FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE badge_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own badge progress" ON badge_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own badge progress" ON badge_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own badge progress" ON badge_progress
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own badge progress" ON badge_progress
  FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE badge_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own badge logs" ON badge_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own badge logs" ON badge_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own badge logs" ON badge_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own badge logs" ON badge_logs
  FOR DELETE USING (auth.uid() = user_id);
