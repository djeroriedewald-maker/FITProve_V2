-- Add missing columns to exercises table
-- Run this if the table exists but columns are missing

-- Check if approval_status column exists, if not add it
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='exercises' AND column_name='approval_status') THEN
        ALTER TABLE exercises ADD COLUMN approval_status VARCHAR(20) DEFAULT 'pending' 
        CHECK (approval_status IN ('pending', 'approved', 'rejected'));
    END IF;
END $$;

-- Check if primary_muscles column exists, if not add it
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='exercises' AND column_name='primary_muscles') THEN
        ALTER TABLE exercises ADD COLUMN primary_muscles TEXT[] NOT NULL DEFAULT '{}';
    END IF;
END $$;

-- Check if secondary_muscles column exists, if not add it
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='exercises' AND column_name='secondary_muscles') THEN
        ALTER TABLE exercises ADD COLUMN secondary_muscles TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Check if equipment column exists, if not add it
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='exercises' AND column_name='equipment') THEN
        ALTER TABLE exercises ADD COLUMN equipment TEXT[] NOT NULL DEFAULT '{}';
    END IF;
END $$;

-- Check if tags column exists, if not add it
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='exercises' AND column_name='tags') THEN
        ALTER TABLE exercises ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Check if is_active column exists, if not add it
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='exercises' AND column_name='is_active') THEN
        ALTER TABLE exercises ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Check if is_featured column exists, if not add it
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='exercises' AND column_name='is_featured') THEN
        ALTER TABLE exercises ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
END $$;