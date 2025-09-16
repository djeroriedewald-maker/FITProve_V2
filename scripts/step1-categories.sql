-- MINIMAL Exercise Database Schema - Step by Step Execution
-- Run each section separately in Supabase SQL Editor

-- SECTION 1: Create exercise_categories table
CREATE TABLE IF NOT EXISTS exercise_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SECTION 2: Insert default categories
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