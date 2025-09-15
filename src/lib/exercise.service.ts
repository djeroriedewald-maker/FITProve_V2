// Exercise Service - Supabase Integration
import { supabase } from './supabase';
import type { 
  Exercise, 
  ExerciseDB, 
  ExerciseCategoryDB,
  ExerciseFilter, 
  ExerciseSearchParams,
  ExerciseSearchResult, 
  CreateExerciseData,
  UpdateExerciseData,
  ExerciseImportData,
  MuscleGroup,
  EquipmentType,
  DifficultyLevel,
  ExerciseCategory
} from '../types/exercise.types';

// Temporary YouTube ID mappings for testing (until database is populated)
const TEMP_YOUTUBE_IDS: Record<string, string> = {
  'push-up': 'IODxDxX7oi4',
  'bench-press': '4Y2ZdHCOXok', 
  'pull-up': 'eGo4IYlbE5g',
  'deadlift': 'ytGaGIn3SjE',
  'squat': 'ultWZbUMPL8',
  'burpee': 'TU8QYVW0gDU',
  'plank': 'pSHjTRCQxIw',
  'jumping-jacks': 'c4DAnQ6DtF8',
  'mountain-climbers': 'nmwgirgXLYM',
  'lunges': 'QOVaHwm-Q6U'
};

// Transform database exercise to frontend exercise
function transformExercise(exerciseDB: ExerciseDB): Exercise {
  // Use database youtube_id if available, otherwise check temp mapping
  const youtube_id = exerciseDB.youtube_id || TEMP_YOUTUBE_IDS[exerciseDB.slug] || null;
  
  return {
    id: exerciseDB.id,
    name: exerciseDB.name,
    slug: exerciseDB.slug,
    description: exerciseDB.description || '',
    instructions: exerciseDB.instructions,
    
    // Media
    image_url: exerciseDB.image_url,
    gif_url: exerciseDB.gif_url,
    video_url: exerciseDB.video_url,
    youtube_id: youtube_id,
    
    // Classification - convert string arrays to typed arrays
    primary_muscles: exerciseDB.primary_muscles as MuscleGroup[],
    secondary_muscles: exerciseDB.secondary_muscles as MuscleGroup[],
    equipment: exerciseDB.equipment as EquipmentType[],
    difficulty: exerciseDB.difficulty,
    category: exerciseDB.category_id as ExerciseCategory,
    
    // Exercise details
    force_type: exerciseDB.force_type,
    mechanics: exerciseDB.mechanics,
    
    // Additional info
    tips: exerciseDB.tips,
    common_mistakes: exerciseDB.common_mistakes,
    variations: exerciseDB.variations,
    contraindications: exerciseDB.contraindications,
    
    // Timestamps
    created_at: exerciseDB.created_at,
    updated_at: exerciseDB.updated_at,
    
    // Workout metadata
    calories_per_minute: exerciseDB.calories_per_minute,
    recommended_sets: exerciseDB.recommended_sets,
    recommended_reps: exerciseDB.recommended_reps,
    rest_time: exerciseDB.recommended_rest_seconds,
    
    // Search optimization
    tags: exerciseDB.tags,
    popularity_score: exerciseDB.popularity_score,
    is_featured: exerciseDB.is_featured
  };
}

export class ExerciseService {
  // Get all exercises with optional filtering
  static async getExercises(filters?: ExerciseFilter): Promise<ExerciseSearchResult> {
    try {
      let query = supabase
        .from('exercises')
        .select('*')
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .order('popularity_score', { ascending: false });

      // Apply filters
      if (filters?.muscle_groups?.length) {
        query = query.overlaps('primary_muscles', filters.muscle_groups);
      }

      if (filters?.equipment?.length) {
        query = query.overlaps('equipment', filters.equipment);
      }

      if (filters?.difficulty?.length) {
        query = query.in('difficulty', filters.difficulty);
      }

      if (filters?.category?.length) {
        query = query.in('category_id', filters.category);
      }

      if (filters?.search_query) {
        // Use simple case-insensitive search in name field
        query = query.ilike('name', `%${filters.search_query}%`);
      }

      const { data: exercisesDB, error, count } = await query;

      if (error) {
        console.error('Error fetching exercises:', error);
        throw error;
      }

      const exercises = exercisesDB?.map(transformExercise) || [];

      return {
        exercises,
        total_count: count || 0,
        filtered_count: exercises.length
      };
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
      return {
        exercises: [],
        total_count: 0,
        filtered_count: 0
      };
    }
  }

  // Advanced search with pagination and scoring
  static async searchExercises(params: ExerciseSearchParams): Promise<ExerciseSearchResult> {
    try {
      const { 
        search_query,
        muscle_groups,
        equipment_types,
        difficulty_levels,
        category_ids,
        limit_count = 50,
        offset_count = 0
      } = params;

      // Use the search function from database
      const { data, error } = await supabase.rpc('search_exercises', {
        search_query: search_query || '',
        muscle_groups: muscle_groups || [],
        equipment_types: equipment_types || [],
        difficulty_levels: difficulty_levels || [],
        category_ids: category_ids || [],
        limit_count,
        offset_count
      });

      if (error) {
        console.error('Error searching exercises:', error);
        throw error;
      }

      const exercises = data?.map(transformExercise) || [];

      // Get total count for pagination
      const { count } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('approval_status', 'approved');

      return {
        exercises,
        total_count: count || 0,
        filtered_count: exercises.length
      };
    } catch (error) {
      console.error('Failed to search exercises:', error);
      return {
        exercises: [],
        total_count: 0,
        filtered_count: 0
      };
    }
  }

  // Get single exercise by ID or slug
  static async getExercise(identifier: string): Promise<Exercise | null> {
    try {
      const query = supabase
        .from('exercises')
        .select('*')
        .eq('is_active', true)
        .eq('approval_status', 'approved');

      // Check if identifier is UUID (id) or slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      
      if (isUUID) {
        query.eq('id', identifier);
      } else {
        query.eq('slug', identifier);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No exercise found
        }
        console.error('Error fetching exercise:', error);
        throw error;
      }

      return data ? transformExercise(data) : null;
    } catch (error) {
      console.error('Failed to fetch exercise:', error);
      return null;
    }
  }

  // Get featured exercises
  static async getFeaturedExercises(limit: number = 10): Promise<Exercise[]> {
    try {
      const { data: exercisesDB, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .eq('is_featured', true)
        .order('popularity_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured exercises:', error);
        throw error;
      }

      return exercisesDB?.map(transformExercise) || [];
    } catch (error) {
      console.error('Failed to fetch featured exercises:', error);
      return [];
    }
  }

  // Get exercises by muscle group
  static async getExercisesByMuscleGroup(muscleGroup: MuscleGroup, limit: number = 20): Promise<Exercise[]> {
    try {
      const { data: exercisesDB, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .contains('primary_muscles', [muscleGroup])
        .order('popularity_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching exercises by muscle group:', error);
        throw error;
      }

      return exercisesDB?.map(transformExercise) || [];
    } catch (error) {
      console.error('Failed to fetch exercises by muscle group:', error);
      return [];
    }
  }

  // Get exercise categories
  static async getCategories(): Promise<ExerciseCategoryDB[]> {
    try {
      const { data, error } = await supabase
        .from('exercise_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching exercise categories:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch exercise categories:', error);
      return [];
    }
  }

  // Admin Functions (require authentication)

  // Create new exercise
  static async createExercise(exerciseData: CreateExerciseData): Promise<Exercise | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      // Generate slug from name
      const slug = exerciseData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const { data, error } = await supabase
        .from('exercises')
        .insert({
          ...exerciseData,
          slug,
          created_by: user.id,
          approval_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating exercise:', error);
        throw error;
      }

      return data ? transformExercise(data) : null;
    } catch (error) {
      console.error('Failed to create exercise:', error);
      return null;
    }
  }

  // Update exercise
  static async updateExercise(exerciseData: UpdateExerciseData): Promise<Exercise | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const { id, ...updateData } = exerciseData;

      // Update slug if name changed
      if (updateData.name) {
        updateData.slug = updateData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      const { data, error } = await supabase
        .from('exercises')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating exercise:', error);
        throw error;
      }

      return data ? transformExercise(data) : null;
    } catch (error) {
      console.error('Failed to update exercise:', error);
      return null;
    }
  }

  // Bulk import exercises
  static async importExercises(exercises: ExerciseImportData[]): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const exercisesToInsert = exercises.map(exercise => ({
        name: exercise.name,
        slug: exercise.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        description: exercise.description || '',
        instructions: exercise.instructions || [],
        primary_muscles: exercise.muscle_groups || [],
        equipment: exercise.equipment || [],
        difficulty: (exercise.difficulty as DifficultyLevel) || 'beginner',
        tips: exercise.tips || [],
        variations: exercise.variations || [],
        tags: [exercise.name.toLowerCase(), ...(exercise.muscle_groups || [])],
        created_by: user.id,
        approval_status: 'pending'
      }));

      const { error } = await supabase
        .from('exercises')
        .insert(exercisesToInsert);

      if (error) {
        console.error('Error importing exercises:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to import exercises:', error);
      return false;
    }
  }

  // Update exercise popularity (for tracking usage)
  static async updatePopularity(exerciseId: string): Promise<void> {
    try {
      await supabase.rpc('increment_exercise_popularity', {
        exercise_id: exerciseId
      });
    } catch (error) {
      console.error('Failed to update exercise popularity:', error);
    }
  }
}