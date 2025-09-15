-- Exercise Database Schema for Supabase
-- Execute this in Supabase SQL Editor to create the exercise system

-- Drop existing tables if they exist (for clean slate)
DROP TABLE IF EXISTS public.exercise_categories CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;

-- Create exercise categories lookup table
CREATE TABLE public.exercise_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  color text DEFAULT '#6B7280', -- hex color for UI
  icon text, -- icon name for UI
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create main exercises table
CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  name text NOT NULL,
  slug text UNIQUE NOT NULL, -- URL-friendly name
  description text,
  instructions text[], -- Step-by-step instructions
  
  -- Media
  image_url text,
  gif_url text, -- For exercise demonstrations
  video_url text,
  youtube_id text, -- YouTube video ID
  
  -- Classification
  primary_muscles text[] NOT NULL DEFAULT '{}',
  secondary_muscles text[] DEFAULT '{}',
  equipment text[] NOT NULL DEFAULT '{}',
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category_id uuid REFERENCES public.exercise_categories(id),
  
  -- Exercise Details
  force_type text CHECK (force_type IN ('push', 'pull', 'static', 'explosive')),
  mechanics text CHECK (mechanics IN ('compound', 'isolation')),
  
  -- Additional Information
  tips text[] DEFAULT '{}',
  common_mistakes text[] DEFAULT '{}',
  variations text[] DEFAULT '{}',
  contraindications text[] DEFAULT '{}', -- When NOT to do this exercise
  
  -- Workout Metadata
  calories_per_minute integer,
  recommended_sets integer,
  recommended_reps text, -- e.g., "8-12", "30 seconds", "to failure"
  recommended_rest_seconds integer,
  
  -- Search and Organization
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  popularity_score integer DEFAULT 0, -- For ranking popular exercises
  
  -- Admin metadata
  created_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      name || ' ' || 
      COALESCE(description, '') || ' ' || 
      array_to_string(primary_muscles, ' ') || ' ' ||
      array_to_string(secondary_muscles, ' ') || ' ' ||
      array_to_string(equipment, ' ') || ' ' ||
      array_to_string(tags, ' ')
    )
  ) STORED
);

-- Create indexes for performance
CREATE INDEX idx_exercises_search ON public.exercises USING GIN(search_vector);
CREATE INDEX idx_exercises_primary_muscles ON public.exercises USING GIN(primary_muscles);
CREATE INDEX idx_exercises_secondary_muscles ON public.exercises USING GIN(secondary_muscles);
CREATE INDEX idx_exercises_equipment ON public.exercises USING GIN(equipment);
CREATE INDEX idx_exercises_difficulty ON public.exercises(difficulty);
CREATE INDEX idx_exercises_category ON public.exercises(category_id);
CREATE INDEX idx_exercises_active ON public.exercises(is_active);
CREATE INDEX idx_exercises_featured ON public.exercises(is_featured);
CREATE INDEX idx_exercises_popularity ON public.exercises(popularity_score DESC);
CREATE INDEX idx_exercises_slug ON public.exercises(slug);
CREATE INDEX idx_exercises_approval_status ON public.exercises(approval_status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_exercises_updated_at 
    BEFORE UPDATE ON public.exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_categories_updated_at 
    BEFORE UPDATE ON public.exercise_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercises
CREATE POLICY "Exercises are viewable by everyone"
  ON public.exercises FOR SELECT
  USING (is_active = true AND approval_status = 'approved');

CREATE POLICY "Authenticated users can insert exercises"
  ON public.exercises FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own exercises"
  ON public.exercises FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admin users can manage all exercises"
  ON public.exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (profiles.role = 'admin' OR profiles.role = 'trainer')
    )
  );

-- RLS Policies for exercise categories
CREATE POLICY "Exercise categories are viewable by everyone"
  ON public.exercise_categories FOR SELECT
  USING (true);

CREATE POLICY "Admin users can manage exercise categories"
  ON public.exercise_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Insert default exercise categories
INSERT INTO public.exercise_categories (name, description, color, icon) VALUES
('Strength Training', 'Exercises focused on building muscle strength and mass', '#DC2626', 'dumbbell'),
('Cardio', 'Cardiovascular exercises for heart health and endurance', '#DC2626', 'heart'),
('Flexibility', 'Stretching and mobility exercises', '#059669', 'move'),
('Balance', 'Exercises to improve stability and coordination', '#7C3AED', 'balance'),
('Functional', 'Real-world movement patterns and functional strength', '#EA580C', 'activity'),
('Rehabilitation', 'Therapeutic exercises for injury recovery', '#0891B2', 'bandage'),
('Plyometric', 'Explosive power and athletic performance exercises', '#B91C1C', 'zap'),
('Isometric', 'Static holds and isometric contractions', '#4338CA', 'pause');

-- Create view for frontend consumption
CREATE OR REPLACE VIEW public.exercises_with_category AS
SELECT 
  e.*,
  ec.name as category_name,
  ec.color as category_color,
  ec.icon as category_icon
FROM public.exercises e
LEFT JOIN public.exercise_categories ec ON e.category_id = ec.id
WHERE e.is_active = true AND e.approval_status = 'approved';

-- Grant permissions for the view
GRANT SELECT ON public.exercises_with_category TO anon, authenticated;

-- Create function for exercise search
CREATE OR REPLACE FUNCTION search_exercises(
  search_query text DEFAULT '',
  muscle_groups text[] DEFAULT '{}',
  equipment_types text[] DEFAULT '{}',
  difficulty_levels text[] DEFAULT '{}',
  category_ids uuid[] DEFAULT '{}',
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  image_url text,
  primary_muscles text[],
  secondary_muscles text[],
  equipment text[],
  difficulty text,
  category_name text,
  popularity_score integer
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
    e.image_url,
    e.primary_muscles,
    e.secondary_muscles,
    e.equipment,
    e.difficulty,
    ec.name as category_name,
    e.popularity_score
  FROM public.exercises e
  LEFT JOIN public.exercise_categories ec ON e.category_id = ec.id
  WHERE 
    e.is_active = true 
    AND e.approval_status = 'approved'
    AND (
      search_query = '' OR 
      e.search_vector @@ plainto_tsquery('english', search_query)
    )
    AND (
      array_length(muscle_groups, 1) IS NULL OR
      e.primary_muscles && muscle_groups OR
      e.secondary_muscles && muscle_groups
    )
    AND (
      array_length(equipment_types, 1) IS NULL OR
      e.equipment && equipment_types
    )
    AND (
      array_length(difficulty_levels, 1) IS NULL OR
      e.difficulty = ANY(difficulty_levels)
    )
    AND (
      array_length(category_ids, 1) IS NULL OR
      e.category_id = ANY(category_ids)
    )
  ORDER BY 
    CASE WHEN search_query != '' THEN ts_rank(e.search_vector, plainto_tsquery('english', search_query)) END DESC,
    e.popularity_score DESC,
    e.name ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Grant execute permissions on the search function
GRANT EXECUTE ON FUNCTION search_exercises TO anon, authenticated;

-- Create function to increment popularity
CREATE OR REPLACE FUNCTION increment_exercise_popularity(exercise_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.exercises 
  SET popularity_score = popularity_score + 1
  WHERE id = exercise_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_exercise_popularity TO authenticated;

-- Verify the schema
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('exercises', 'exercise_categories')
ORDER BY table_name, ordinal_position;