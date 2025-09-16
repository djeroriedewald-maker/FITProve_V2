-- Clean slate: Drop existing tables and recreate properly
-- CAUTION: This will delete any existing data

-- Drop existing tables if they exist
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS exercise_categories CASCADE;

-- Recreate exercise_categories table
CREATE TABLE exercise_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default categories
INSERT INTO exercise_categories (name, description, color, icon) VALUES
    ('strength', 'Resistance and weight training exercises', '#ef4444', 'dumbbell'),
    ('cardio', 'Cardiovascular and endurance exercises', '#f97316', 'heart'),
    ('flexibility', 'Stretching and mobility exercises', '#84cc16', 'maximize-2'),
    ('mobility', 'Joint mobility and movement exercises', '#06b6d4', 'rotate-cw'),
    ('balance', 'Balance and stability exercises', '#8b5cf6', 'target'),
    ('endurance', 'Muscular endurance exercises', '#ec4899', 'battery'),
    ('power', 'Explosive power and athletic exercises', '#f59e0b', 'zap'),
    ('rehabilitation', 'Recovery and therapeutic exercises', '#10b981', 'shield');

-- Create complete exercises table
CREATE TABLE exercises (
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
    
    -- Exercise classification - THESE ARE CRITICAL
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
    
    -- Organization and search - THESE ARE CRITICAL
    tags TEXT[] DEFAULT '{}',
    search_vector tsvector,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    popularity_score INTEGER DEFAULT 0,
    
    -- Admin fields - THIS IS THE MISSING COLUMN
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);