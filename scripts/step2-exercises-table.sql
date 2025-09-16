-- SECTION 3: Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL UNIQUE,
    description TEXT,
    instructions TEXT[] NOT NULL DEFAULT '{}',
    
    -- Media fields
    image_url TEXT,
    gif_url TEXT,
    video_url TEXT,
    youtube_id VARCHAR(20),
    
    -- Exercise classification
    primary_muscles TEXT[] NOT NULL DEFAULT '{}',
    secondary_muscles TEXT[] DEFAULT '{}',
    equipment TEXT[] NOT NULL DEFAULT '{}',
    difficulty VARCHAR(20) NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    category_id VARCHAR(50),
    
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
    recommended_reps VARCHAR(50),
    recommended_rest_seconds INTEGER,
    
    -- Organization and search
    tags TEXT[] DEFAULT '{}',
    search_vector tsvector,
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