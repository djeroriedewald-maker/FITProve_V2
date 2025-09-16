-- COPY AND PASTE THIS INTO SUPABASE SQL EDITOR
-- Go to: https://supabase.com/dashboard/project/[your-project]/sql

-- Create search function with full-text search and ranking
CREATE OR REPLACE FUNCTION search_exercises(
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
    approval_status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    search_rank REAL
) AS $$
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
                CASE WHEN LOWER(e.name) LIKE LOWER('%' || search_query || '%') THEN 0.5 ELSE 0 END +
                -- Boost featured exercises
                CASE WHEN e.is_featured THEN 0.2 ELSE 0 END +
                -- Boost by popularity
                (e.popularity_score::REAL / 1000.0)
            ELSE 
                -- Default ranking when no search query
                CASE WHEN e.is_featured THEN 1.0 ELSE 0.5 END +
                (e.popularity_score::REAL / 1000.0)
        END AS search_rank
    FROM exercises e
    WHERE 
        e.is_active = true 
        AND e.approval_status = 'approved'
        AND (
            search_query IS NULL 
            OR e.search_vector @@ plainto_tsquery('english', search_query)
            OR LOWER(e.name) LIKE LOWER('%' || search_query || '%')
            OR LOWER(e.description) LIKE LOWER('%' || search_query || '%')
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
    ORDER BY search_rank DESC, e.popularity_score DESC, e.name ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;