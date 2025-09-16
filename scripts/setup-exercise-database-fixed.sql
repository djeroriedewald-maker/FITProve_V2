-- Exercise Database Migration - Execute in Supabase SQL Editor
-- This creates the complete exercise database schema
-- CORRECTED VERSION - Proper dependencies and order

-- Step 1: Create exercise categories table first
CREATE TABLE IF NOT EXISTS exercise_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) NOT NULL DEFAULT '#3b82f6', -- Hex color code
    icon VARCHAR(50), -- Icon name for UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 2: Insert default exercise categories
INSERT INTO exercise_categories (name, description, color, icon) VALUES
    ('strength', 'Resistance and weight training exercises', '#ef4444', 'dumbbell'),
    ('cardio', 'Cardiovascular and endurance exercises', '#f97316', 'heart'),
    ('flexibility', 'Stretching and mobility exercises', '#84cc16', 'maximize-2'),
    ('mobility', 'Joint mobility and movement exercises', '#06b6d4', 'rotate-cw'),
    ('balance', 'Balance and stability exercises', '#8b5cf6', 'target'),
    ('endurance', 'Muscular endurance exercises', '#ec4899', 'battery'),
    ('power', 'Explosive power and athletic exercises', '#f59e0b', 'zap'),
    ('rehabilitation', 'Recovery and therapeutic exercises', '#10b981', 'shield')
ON CONFLICT (name) DO NOTHING;

-- Step 3: Create exercises table (now references can work)
CREATE TABLE IF NOT EXISTS exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL UNIQUE, -- URL-friendly name
    description TEXT,
    instructions TEXT[] NOT NULL DEFAULT '{}', -- Array of instruction steps
    
    -- Media fields
    image_url TEXT,
    gif_url TEXT,
    video_url TEXT,
    youtube_id VARCHAR(20), -- YouTube video ID
    
    -- Exercise classification
    primary_muscles TEXT[] NOT NULL DEFAULT '{}', -- Primary muscle groups
    secondary_muscles TEXT[] DEFAULT '{}', -- Secondary muscle groups
    equipment TEXT[] NOT NULL DEFAULT '{}', -- Required equipment
    difficulty VARCHAR(20) NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    category_id VARCHAR(50), -- Changed to reference name for easier imports
    
    -- Exercise characteristics
    force_type VARCHAR(20) CHECK (force_type IN ('push', 'pull', 'static', 'explosive')),
    mechanics VARCHAR(20) CHECK (mechanics IN ('compound', 'isolation')),
    
    -- Additional information
    tips TEXT[] DEFAULT '{}',
    common_mistakes TEXT[] DEFAULT '{}',
    variations TEXT[] DEFAULT '{}',
    contraindications TEXT[] DEFAULT '{}',
    
    -- Workout metadata
    calories_per_minute INTEGER,
    recommended_sets INTEGER,
    recommended_reps VARCHAR(50), -- e.g., "8-12", "30 seconds", "Until failure"
    recommended_rest_seconds INTEGER,
    
    -- Organization and search
    tags TEXT[] DEFAULT '{}',
    search_vector tsvector, -- Full-text search
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    popularity_score INTEGER DEFAULT 0,
    
    -- Admin fields
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 4: Create indexes for performance
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

-- Step 5: Create utility functions
CREATE OR REPLACE FUNCTION update_exercise_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
                        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
                        setweight(to_tsvector('english', array_to_string(NEW.primary_muscles, ' ')), 'C') ||
                        setweight(to_tsvector('english', array_to_string(NEW.equipment, ' ')), 'C') ||
                        setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create triggers
DROP TRIGGER IF EXISTS trigger_update_exercise_search_vector ON exercises;
CREATE TRIGGER trigger_update_exercise_search_vector
    BEFORE INSERT OR UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_exercise_search_vector();

DROP TRIGGER IF EXISTS trigger_update_exercises_updated_at ON exercises;
CREATE TRIGGER trigger_update_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_exercise_categories_updated_at ON exercise_categories;
CREATE TRIGGER trigger_update_exercise_categories_updated_at
    BEFORE UPDATE ON exercise_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Create search function
CREATE OR REPLACE FUNCTION search_exercises(
    search_query TEXT DEFAULT '',
    muscle_groups TEXT[] DEFAULT '{}',
    equipment_types TEXT[] DEFAULT '{}',
    difficulty_levels TEXT[] DEFAULT '{}',
    category_ids TEXT[] DEFAULT '{}',
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(200),
    slug VARCHAR(250),
    description TEXT,
    instructions TEXT[],
    image_url TEXT,
    gif_url TEXT,
    video_url TEXT,
    youtube_id VARCHAR(20),
    primary_muscles TEXT[],
    secondary_muscles TEXT[],
    equipment TEXT[],
    difficulty VARCHAR(20),
    category_id VARCHAR(50),
    force_type VARCHAR(20),
    mechanics VARCHAR(20),
    tips TEXT[],
    common_mistakes TEXT[],
    variations TEXT[],
    contraindications TEXT[],
    calories_per_minute INTEGER,
    recommended_sets INTEGER,
    recommended_reps VARCHAR(50),
    recommended_rest_seconds INTEGER,
    tags TEXT[],
    is_active BOOLEAN,
    is_featured BOOLEAN,
    popularity_score INTEGER,
    created_by UUID,
    approved_by UUID,
    approval_status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT e.*
    FROM exercises e
    WHERE e.is_active = true
      AND e.approval_status = 'approved'
      AND (
        search_query = '' OR 
        e.search_vector @@ plainto_tsquery('english', search_query)
      )
      AND (
        cardinality(muscle_groups) = 0 OR
        e.primary_muscles && muscle_groups
      )
      AND (
        cardinality(equipment_types) = 0 OR
        e.equipment && equipment_types
      )
      AND (
        cardinality(difficulty_levels) = 0 OR
        e.difficulty = ANY(difficulty_levels)
      )
      AND (
        cardinality(category_ids) = 0 OR
        e.category_id = ANY(category_ids)
      )
    ORDER BY 
      CASE WHEN search_query != '' THEN ts_rank(e.search_vector, plainto_tsquery('english', search_query)) ELSE 0 END DESC,
      e.popularity_score DESC,
      e.name ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create popularity function
CREATE OR REPLACE FUNCTION increment_exercise_popularity(exercise_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE exercises 
    SET popularity_score = popularity_score + 1,
        updated_at = now()
    WHERE id = exercise_id;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Enable Row Level Security (RLS)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_categories ENABLE ROW LEVEL SECURITY;

-- Step 10: Create RLS Policies
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

-- Step 11: Grant permissions
GRANT SELECT ON exercises TO anon;
GRANT SELECT ON exercise_categories TO anon;
GRANT ALL ON exercises TO authenticated;
GRANT ALL ON exercise_categories TO authenticated;