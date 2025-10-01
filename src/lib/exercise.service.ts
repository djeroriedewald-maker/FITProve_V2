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
import { exerciseLibrary } from '../data/exerciseLibrary';
import { applyExerciseEnhancements } from '../data/exerciseEnhancements';
import { hyroxEventExercises } from '../data/events/hyroxEventExercises';

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

const LOCAL_FALLBACK_EXERCISES = exerciseLibrary.map(applyExerciseEnhancements);
const HYROX_FALLBACK_EXERCISES = hyroxEventExercises.map(applyExerciseEnhancements);

type NormalizedFilters = {
  muscleGroups?: MuscleGroup[];
  equipment?: EquipmentType[];
  difficulty?: DifficultyLevel[];
  categories?: ExerciseCategory[];
  searchQuery?: string;
};

const normalizeArray = <T extends string>(values?: (T | string)[] | null): T[] | undefined => {
  if (!values || values.length === 0) {
    return undefined;
  }
  const filtered = values.filter((value): value is T => Boolean(value));
  return filtered.length ? (filtered as T[]) : undefined;
};

function normalizeFilters(input?: {
  muscle_groups?: (MuscleGroup | string)[];
  equipment?: (EquipmentType | string)[];
  equipment_types?: (EquipmentType | string)[];
  difficulty?: (DifficultyLevel | string)[];
  difficulty_levels?: (DifficultyLevel | string)[];
  category?: (ExerciseCategory | string)[];
  category_ids?: (ExerciseCategory | string)[];
  search_query?: string | null;
}): NormalizedFilters {
  if (!input) {
    return {};
  }

  const equipment = input.equipment ?? input.equipment_types;
  const difficulty = input.difficulty ?? input.difficulty_levels;
  const categories = input.category ?? input.category_ids;
  const normalizedSearch = input.search_query?.trim();

  return {
    muscleGroups: normalizeArray<MuscleGroup>(input.muscle_groups),
    equipment: normalizeArray<EquipmentType>(equipment),
    difficulty: normalizeArray<DifficultyLevel>(difficulty),
    categories: normalizeArray<ExerciseCategory>(categories),
    searchQuery: normalizedSearch && normalizedSearch.length ? normalizedSearch.toLowerCase() : undefined,
  };
}

function matchesFilters(exercise: Exercise, filters: NormalizedFilters): boolean {
  if (
    (!filters.muscleGroups || filters.muscleGroups.length === 0) &&
    (!filters.equipment || filters.equipment.length === 0) &&
    (!filters.difficulty || filters.difficulty.length === 0) &&
    (!filters.categories || filters.categories.length === 0) &&
    !filters.searchQuery
  ) {
    return true;
  }

  if (filters.muscleGroups?.length) {
    const muscleSet = new Set([
      ...((exercise.primary_muscles as MuscleGroup[]) || []),
      ...((exercise.secondary_muscles as MuscleGroup[]) || []),
    ]);
    const matchesMuscle = filters.muscleGroups.some((muscle) => muscleSet.has(muscle));
    if (!matchesMuscle) {
      return false;
    }
  }

  if (filters.equipment?.length) {
    const equipmentSet = new Set(exercise.equipment || []);
    const matchesEquipment = filters.equipment.some((item) => equipmentSet.has(item));
    if (!matchesEquipment) {
      return false;
    }
  }

  if (filters.difficulty?.length && !filters.difficulty.includes(exercise.difficulty)) {
    return false;
  }

  if (filters.categories?.length) {
    if (!exercise.category || !filters.categories.includes(exercise.category)) {
      return false;
    }
  }

  if (filters.searchQuery) {
    const haystack = [
      exercise.name,
      exercise.description,
      ...(exercise.instructions || []),
      ...((exercise.tags || []) as string[]),
    ];
    const query = filters.searchQuery;
    const matchesSearch = haystack.some(
      (value) => typeof value === 'string' && value.toLowerCase().includes(query)
    );
    if (!matchesSearch) {
      return false;
    }
  }

  return true;
}

function dedupeBySlugOrId(exercises: Exercise[]): Exercise[] {
  const seen = new Set<string>();
  return exercises.filter((exercise) => {
    const key = (exercise.slug || exercise.id).toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function mergeHyroxEventExercises(baseExercises: Exercise[], filters: NormalizedFilters): Exercise[] {
  const seen = new Set<string>(
    baseExercises.map((exercise) => (exercise.slug || exercise.id).toLowerCase())
  );

  const hyroxMatches = HYROX_FALLBACK_EXERCISES
    .filter((exercise) => matchesFilters(exercise, filters))
    .filter((exercise) => {
      const key = (exercise.slug || exercise.id).toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

  if (!hyroxMatches.length) {
    return baseExercises;
  }

  return [...baseExercises, ...hyroxMatches];
}

function buildFallbackExercises(filters: NormalizedFilters): Exercise[] {
  const localMatches = LOCAL_FALLBACK_EXERCISES.filter((exercise) => matchesFilters(exercise, filters));
  const dedupedLocal = dedupeBySlugOrId(localMatches);
  return mergeHyroxEventExercises(dedupedLocal, filters);
}

function paginateExercises(exercises: Exercise[], page: number, pageSize: number): Exercise[] {
  if (pageSize <= 0) {
    return exercises;
  }
  const start = Math.max(0, (page - 1) * pageSize);
  if (start >= exercises.length) {
    return [];
  }
  return exercises.slice(start, start + pageSize);
}

function formatExerciseResult(exercises: Exercise[], page: number, pageSize: number): ExerciseSearchResult {
  const total = exercises.length;
  const paginated = paginateExercises(exercises, page, pageSize);
  return {
    exercises: paginated,
    total_count: total,
    filtered_count: paginated.length,
  };
}
function findFallbackExercise(identifier: string): Exercise | null {
  const key = identifier.toLowerCase();
  const fallbackExercises = buildFallbackExercises({});
  return (
    fallbackExercises.find((exercise) => {
      const slug = exercise.slug?.toLowerCase();
      return exercise.id.toLowerCase() === key || slug === key;
    }) || null
  );
}
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

    // Environment
    environment: exerciseDB.environment || [],

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
  static async getExercises(filters?: ExerciseFilter & { page?: number; pageSize?: number }): Promise<ExerciseSearchResult> {
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 50;
    const normalizedFilters = normalizeFilters({
      muscle_groups: filters?.muscle_groups,
      equipment: filters?.equipment,
      difficulty: filters?.difficulty,
      category: filters?.category,
      search_query: filters?.search_query,
    });

    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('exercises')
        .select('*', { count: 'exact' })
        .order('popularity_score', { ascending: false })
        .range(from, to);

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
        query = query.ilike('name', '%' + filters.search_query + '%');
      }

      const { data: exercisesDB, error, count } = await query;

      if (error) {
        console.error('Error fetching exercises:', error);
        const fallbackExercises = buildFallbackExercises(normalizedFilters);
        return formatExerciseResult(fallbackExercises, page, pageSize);
      }

      let baseExercises = (exercisesDB?.map(transformExercise) || []).map(applyExerciseEnhancements);

      if (!baseExercises.length) {
        const fallbackExercises = buildFallbackExercises(normalizedFilters);
        return formatExerciseResult(fallbackExercises, page, pageSize);
      }

      const merged = mergeHyroxEventExercises(baseExercises, normalizedFilters);
      const hyroxAdded = merged.length - baseExercises.length;
      const paginated = paginateExercises(merged, page, pageSize);

      return {
        exercises: paginated,
        total_count: typeof count === 'number' ? (count || 0) + hyroxAdded : merged.length,
        filtered_count: paginated.length,
      };
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
      const fallbackExercises = buildFallbackExercises(normalizedFilters);
      return formatExerciseResult(fallbackExercises, page, pageSize);
    }
  }
  // Advanced search with pagination and scoring
  // Advanced search with pagination and scoring
  static async searchExercises(params: ExerciseSearchParams): Promise<ExerciseSearchResult> {
    const {
      search_query,
      muscle_groups,
      equipment_types,
      difficulty_levels,
      category_ids,
      limit_count = 50,
      offset_count = 0,
    } = params;

    const limit = limit_count > 0 ? limit_count : 50;
    const offset = offset_count ?? 0;
    const page = Math.floor(offset / limit) + 1;
    const normalizedFilters = normalizeFilters({
      muscle_groups,
      equipment_types,
      difficulty_levels,
      category_ids,
      search_query,
    });

    try {
      const { data, error } = await supabase.rpc('search_exercises', {
        search_query: search_query || '',
        muscle_groups: muscle_groups || [],
        equipment_types: equipment_types || [],
        difficulty_levels: difficulty_levels || [],
        category_ids: category_ids || [],
        limit_count: limit,
        offset_count: offset,
      });

      if (error) {
        console.error('Error searching exercises:', error);
        const fallbackExercises = buildFallbackExercises(normalizedFilters);
        return formatExerciseResult(fallbackExercises, page, limit);
      }

      let baseExercises = (data?.map(transformExercise) || []).map(applyExerciseEnhancements);

      if (!baseExercises.length) {
        const fallbackExercises = buildFallbackExercises(normalizedFilters);
        return formatExerciseResult(fallbackExercises, page, limit);
      }

      const merged = mergeHyroxEventExercises(baseExercises, normalizedFilters);
      const hyroxAdded = merged.length - baseExercises.length;
      let totalCount = merged.length;

      try {
        const { count, error: countError } = await supabase
          .from('exercises')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .eq('approval_status', 'approved');

        if (!countError && typeof count === 'number') {
          totalCount = (count || 0) + hyroxAdded;
        }
      } catch (countError) {
        console.error('Error fetching exercise count for search:', countError);
      }

      const paginated = paginateExercises(merged, page, limit);

      return {
        exercises: paginated,
        total_count: totalCount,
        filtered_count: paginated.length,
      };
    } catch (error) {
      console.error('Failed to search exercises:', error);
      const fallbackExercises = buildFallbackExercises(normalizedFilters);
      return formatExerciseResult(fallbackExercises, page, limit);
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

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

      if (isUUID) {
        query.eq('id', identifier);
      } else {
        query.eq('slug', identifier);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return findFallbackExercise(identifier);
        }
        console.error('Error fetching exercise:', error);
        throw error;
      }

      if (data) {
        return applyExerciseEnhancements(transformExercise(data));
      }

      return findFallbackExercise(identifier);
    } catch (error) {
      console.error('Failed to fetch exercise:', error);
      return findFallbackExercise(identifier);
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

      return (exercisesDB?.map(transformExercise) || []).map(applyExerciseEnhancements);
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

      return (exercisesDB?.map(transformExercise) || []).map(applyExerciseEnhancements);
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