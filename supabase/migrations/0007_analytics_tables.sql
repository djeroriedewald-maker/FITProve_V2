-- Analytics Tables and Views Migration
-- Creates tables and views for exercise analytics and user engagement tracking

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_exercise ON analytics_events (exercise_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON analytics_events (event_type, created_at);

-- Create exercise analytics view
CREATE OR REPLACE VIEW exercise_analytics_view AS
SELECT 
    e.id as exercise_id,
    e.name as exercise_name,
    e.slug,
    e.primary_muscles,
    e.difficulty,
    e.popularity_score,
    COALESCE(view_stats.total_views, 0) as total_views,
    COALESCE(interaction_stats.total_interactions, 0) as total_interactions,
    COALESCE(
        (view_stats.total_views * 1.0 + interaction_stats.total_interactions * 3.0) / 
        NULLIF(view_stats.total_views + interaction_stats.total_interactions, 0),
        0
    ) as avg_engagement_score,
    COALESCE(recent_stats.last_viewed, e.created_at) as last_viewed,
    CASE 
        WHEN recent_stats.recent_views > past_stats.past_views THEN 'rising'
        WHEN recent_stats.recent_views < past_stats.past_views THEN 'declining'
        ELSE 'stable'
    END as popularity_trend
FROM exercises e
LEFT JOIN (
    -- Total views
    SELECT 
        exercise_id,
        COUNT(*) as total_views
    FROM analytics_events 
    WHERE event_type = 'exercise_view' 
    AND exercise_id IS NOT NULL
    GROUP BY exercise_id
) view_stats ON e.id = view_stats.exercise_id
LEFT JOIN (
    -- Total interactions
    SELECT 
        exercise_id,
        COUNT(*) as total_interactions
    FROM analytics_events 
    WHERE event_type = 'exercise_interaction' 
    AND exercise_id IS NOT NULL
    GROUP BY exercise_id
) interaction_stats ON e.id = interaction_stats.exercise_id
LEFT JOIN (
    -- Recent activity (last 7 days)
    SELECT 
        exercise_id,
        COUNT(*) as recent_views,
        MAX(created_at) as last_viewed
    FROM analytics_events 
    WHERE event_type = 'exercise_view' 
    AND exercise_id IS NOT NULL
    AND created_at >= NOW() - INTERVAL '7 days'
    GROUP BY exercise_id
) recent_stats ON e.id = recent_stats.exercise_id
LEFT JOIN (
    -- Past activity (7-14 days ago)
    SELECT 
        exercise_id,
        COUNT(*) as past_views
    FROM analytics_events 
    WHERE event_type = 'exercise_view' 
    AND exercise_id IS NOT NULL
    AND created_at >= NOW() - INTERVAL '14 days'
    AND created_at < NOW() - INTERVAL '7 days'
    GROUP BY exercise_id
) past_stats ON e.id = past_stats.exercise_id
WHERE e.is_active = true;

-- Create user engagement view
CREATE OR REPLACE VIEW user_engagement_view AS
SELECT 
    u.id as user_id,
    COALESCE(session_stats.total_sessions, 0) as total_sessions,
    COALESCE(view_stats.total_exercise_views, 0) as total_exercise_views,
    COALESCE(session_stats.avg_session_duration, 0) as avg_session_duration,
    COALESCE(muscle_prefs.favorite_muscle_groups, ARRAY[]::text[]) as favorite_muscle_groups,
    COALESCE(recent_stats.last_active, u.created_at) as last_active
FROM auth.users u
LEFT JOIN (
    -- Session statistics
    SELECT 
        user_id,
        COUNT(DISTINCT DATE(created_at)) as total_sessions,
        AVG(CAST(metadata->>'session_duration' AS INTEGER)) as avg_session_duration
    FROM analytics_events 
    WHERE event_type = 'session_end' 
    AND user_id IS NOT NULL
    AND metadata->>'session_duration' IS NOT NULL
    GROUP BY user_id
) session_stats ON u.id = session_stats.user_id
LEFT JOIN (
    -- Exercise view statistics
    SELECT 
        user_id,
        COUNT(*) as total_exercise_views
    FROM analytics_events 
    WHERE event_type = 'exercise_view' 
    AND user_id IS NOT NULL
    GROUP BY user_id
) view_stats ON u.id = view_stats.user_id
LEFT JOIN (
    -- Favorite muscle groups (top 3 most viewed)
    SELECT 
        ae.user_id,
        ARRAY_AGG(muscle_group ORDER BY view_count DESC) as favorite_muscle_groups
    FROM (
        SELECT 
            ae.user_id,
            UNNEST(e.primary_muscles) as muscle_group,
            COUNT(*) as view_count,
            ROW_NUMBER() OVER (PARTITION BY ae.user_id ORDER BY COUNT(*) DESC) as rn
        FROM analytics_events ae
        JOIN exercises e ON ae.exercise_id = e.id
        WHERE ae.event_type = 'exercise_view'
        AND ae.user_id IS NOT NULL
        GROUP BY ae.user_id, UNNEST(e.primary_muscles)
    ) ae
    WHERE ae.rn <= 3
    GROUP BY ae.user_id
) muscle_prefs ON u.id = muscle_prefs.user_id
LEFT JOIN (
    -- Last activity
    SELECT 
        user_id,
        MAX(created_at) as last_active
    FROM analytics_events 
    WHERE user_id IS NOT NULL
    GROUP BY user_id
) recent_stats ON u.id = recent_stats.user_id;

-- Create function to get trending exercises
CREATE OR REPLACE FUNCTION get_trending_exercises(
    timeframe_days INTEGER DEFAULT 7,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    exercise_id UUID,
    exercise_name VARCHAR,
    view_count BIGINT,
    interaction_count BIGINT,
    trend_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.name,
        COALESCE(views.view_count, 0) as view_count,
        COALESCE(interactions.interaction_count, 0) as interaction_count,
        (COALESCE(views.view_count, 0) * 1.0 + COALESCE(interactions.interaction_count, 0) * 3.0) as trend_score
    FROM exercises e
    LEFT JOIN (
        SELECT 
            exercise_id,
            COUNT(*) as view_count
        FROM analytics_events
        WHERE event_type = 'exercise_view'
        AND exercise_id IS NOT NULL
        AND created_at >= NOW() - (timeframe_days || ' days')::INTERVAL
        GROUP BY exercise_id
    ) views ON e.id = views.exercise_id
    LEFT JOIN (
        SELECT 
            exercise_id,
            COUNT(*) as interaction_count
        FROM analytics_events
        WHERE event_type = 'exercise_interaction'
        AND exercise_id IS NOT NULL
        AND created_at >= NOW() - (timeframe_days || ' days')::INTERVAL
        GROUP BY exercise_id
    ) interactions ON e.id = interactions.exercise_id
    WHERE e.is_active = true
    AND (views.view_count > 0 OR interactions.interaction_count > 0)
    ORDER BY trend_score DESC, e.popularity_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean old analytics data
CREATE OR REPLACE FUNCTION cleanup_old_analytics(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analytics_events 
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can insert their own analytics events" ON analytics_events
    FOR INSERT 
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can view their own analytics events" ON analytics_events
    FOR SELECT 
    USING (user_id = auth.uid() OR user_id IS NULL);

-- Allow admins to view all analytics (you'll need to create an admin role)
CREATE POLICY "Admins can view all analytics" ON analytics_events
    FOR ALL 
    USING (auth.jwt() ->> 'role' = 'admin');

-- Grant permissions
GRANT SELECT ON exercise_analytics_view TO anon, authenticated;
GRANT SELECT ON user_engagement_view TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_exercises TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_analytics TO authenticated;

-- Insert some sample analytics events for testing (optional)
-- INSERT INTO analytics_events (event_type, metadata) VALUES
-- ('session_start', '{"user_agent": "test", "screen_resolution": "1920x1080"}'),
-- ('exercise_view', '{"exercise_id": "test-id", "exercise_name": "Push-ups", "view_source": "grid"}'),
-- ('exercise_interaction', '{"exercise_id": "test-id", "exercise_name": "Push-ups", "interaction_type": "modal_open"}');