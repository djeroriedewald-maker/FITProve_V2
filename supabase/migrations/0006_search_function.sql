-- Full-Text Search Function for Exercises
-- This creates a PostgreSQL function for advanced exercise search with ranking

-- Create the search_exercises function
CREATE OR REPLACE FUNCTION public.search_exercises(
    search_query TEXT DEFAULT NULL,
    muscle_groups TEXT[] DEFAULT NULL,
    equipment_types TEXT[] DEFAULT NULL,
    difficulty_levels TEXT[] DEFAULT NULL,
    category_ids TEXT[] DEFAULT NULL,
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
    updated_at TIMESTAMP WITH TIME ZONE,
    search_rank REAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.name,
        e.slug,
        e.description,
        e.instructions,
        e.image_url,
        e.gif_url,
        e.video_url,
        e.youtube_id,
        e.primary_muscles,
        e.secondary_muscles,
        e.equipment,
        e.difficulty,
        e.category_id,
        e.force_type,
        e.mechanics,
        e.tips,
        e.common_mistakes,
        e.variations,
        e.contraindications,
        e.calories_per_minute,
        e.recommended_sets,
        e.recommended_reps,
        e.recommended_rest_seconds,
        e.tags,
        e.is_active,
        e.is_featured,
        e.popularity_score,
        e.created_by,
        e.approved_by,
        e.approval_status,
        e.created_at,
        e.updated_at,
        CASE 
            WHEN search_query IS NOT NULL THEN
                ts_rank_cd(
                    e.search_vector,
                    plainto_tsquery('english', search_query)
                ) + 
                -- Boost exact name matches
                CASE WHEN LOWER(e.name) ILIKE '%' || LOWER(search_query) || '%' THEN 0.5 ELSE 0 END +
                -- Boost tag matches
                CASE WHEN search_query = ANY(e.tags) THEN 0.3 ELSE 0 END +
                -- Boost featured exercises
                CASE WHEN e.is_featured THEN 0.2 ELSE 0 END
            ELSE 
                e.popularity_score::REAL / 100.0 + 
                CASE WHEN e.is_featured THEN 0.2 ELSE 0 END
        END AS search_rank
    FROM exercises e
    WHERE 
        e.is_active = true 
        AND e.approval_status = 'approved'
        AND (
            search_query IS NULL 
            OR e.search_vector @@ plainto_tsquery('english', search_query)
            OR LOWER(e.name) ILIKE '%' || LOWER(search_query) || '%'
            OR search_query = ANY(e.tags)
        )
        AND (
            muscle_groups IS NULL 
            OR e.primary_muscles && muscle_groups
            OR e.secondary_muscles && muscle_groups
        )
        AND (
            equipment_types IS NULL 
            OR e.equipment && equipment_types
        )
        AND (
            difficulty_levels IS NULL 
            OR e.difficulty = ANY(difficulty_levels)
        )
        AND (
            category_ids IS NULL 
            OR e.category_id = ANY(category_ids)
        )
    ORDER BY 
        CASE 
            WHEN search_query IS NOT NULL THEN
                ts_rank_cd(
                    e.search_vector,
                    plainto_tsquery('english', search_query)
                ) + 
                CASE WHEN LOWER(e.name) ILIKE '%' || LOWER(search_query) || '%' THEN 0.5 ELSE 0 END +
                CASE WHEN search_query = ANY(e.tags) THEN 0.3 ELSE 0 END +
                CASE WHEN e.is_featured THEN 0.2 ELSE 0 END
            ELSE 
                e.popularity_score::REAL / 100.0 + 
                CASE WHEN e.is_featured THEN 0.2 ELSE 0 END
        END DESC,
        e.popularity_score DESC,
        e.name ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Update search vectors for existing exercises
UPDATE exercises 
SET search_vector = to_tsvector('english', 
    COALESCE(name, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(array_to_string(primary_muscles, ' '), '') || ' ' || 
    COALESCE(array_to_string(secondary_muscles, ' '), '') || ' ' || 
    COALESCE(array_to_string(equipment, ' '), '') || ' ' || 
    COALESCE(array_to_string(tags, ' '), '') || ' ' ||
    COALESCE(difficulty, '') || ' ' ||
    COALESCE(force_type, '') || ' ' ||
    COALESCE(mechanics, '')
);

-- Create function to automatically update search vector on insert/update
CREATE OR REPLACE FUNCTION update_exercise_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.name, '') || ' ' || 
        COALESCE(NEW.description, '') || ' ' || 
        COALESCE(array_to_string(NEW.primary_muscles, ' '), '') || ' ' || 
        COALESCE(array_to_string(NEW.secondary_muscles, ' '), '') || ' ' || 
        COALESCE(array_to_string(NEW.equipment, ' '), '') || ' ' || 
        COALESCE(array_to_string(NEW.tags, ' '), '') || ' ' ||
        COALESCE(NEW.difficulty, '') || ' ' ||
        COALESCE(NEW.force_type, '') || ' ' ||
        COALESCE(NEW.mechanics, '')
    );
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS trigger_update_exercise_search_vector ON exercises;
CREATE TRIGGER trigger_update_exercise_search_vector
    BEFORE INSERT OR UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_exercise_search_vector();

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.search_exercises TO authenticated;

-- Add index for better search performance
CREATE INDEX IF NOT EXISTS idx_exercises_search_vector ON exercises USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups ON exercises USING gin(primary_muscles, secondary_muscles);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises USING gin(equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_tags ON exercises USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category_id);
CREATE INDEX IF NOT EXISTS idx_exercises_active_approved ON exercises(is_active, approval_status);
CREATE INDEX IF NOT EXISTS idx_exercises_featured ON exercises(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_exercises_popularity ON exercises(popularity_score DESC);