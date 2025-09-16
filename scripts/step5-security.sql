-- SECTION 6: Row Level Security
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DROP POLICY IF EXISTS "Public read access for approved exercises" ON exercises;
CREATE POLICY "Public read access for approved exercises" ON exercises
    FOR SELECT USING (is_active = true AND approval_status = 'approved');

DROP POLICY IF EXISTS "Public read access for exercise categories" ON exercise_categories;
CREATE POLICY "Public read access for exercise categories" ON exercise_categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create exercises" ON exercises;
CREATE POLICY "Authenticated users can create exercises" ON exercises
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own exercises" ON exercises;
CREATE POLICY "Users can update own exercises" ON exercises
    FOR UPDATE USING (auth.uid() = created_by);

-- Grant permissions
GRANT SELECT ON exercises TO anon;
GRANT SELECT ON exercise_categories TO anon;
GRANT ALL ON exercises TO authenticated;
GRANT ALL ON exercise_categories TO authenticated;