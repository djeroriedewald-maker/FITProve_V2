-- SECTION 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_exercises_primary_muscles ON exercises USING GIN (primary_muscles);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises USING GIN (equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises (difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises (category_id);
CREATE INDEX IF NOT EXISTS idx_exercises_search_vector ON exercises USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_exercises_is_active ON exercises (is_active);
CREATE INDEX IF NOT EXISTS idx_exercises_approval_status ON exercises (approval_status);
CREATE INDEX IF NOT EXISTS idx_exercises_popularity ON exercises (popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_exercises_slug ON exercises (slug);
CREATE INDEX IF NOT EXISTS idx_exercises_tags ON exercises USING GIN (tags);