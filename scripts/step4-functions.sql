-- SECTION 5: Create functions and triggers
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

-- Create triggers
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