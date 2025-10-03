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
  ExerciseCategory,
} from '../types/exercise.types';
import { exerciseLibrary } from '../data/exerciseLibrary';
import { applyExerciseEnhancements } from '../data/exerciseEnhancements';
import { hyroxEventExercises } from '../data/events/hyroxEventExercises';

// Temporary YouTube ID mappings for testing (until database is populated)
const TEMP_YOUTUBE_IDS: Record<string, string> = {
  'push-up': 'IODxDxX7oi4',
  'bench-press': '4Y2ZdHCOXok',
  'pull-up': 'eGo4IYlbE5g',
  deadlift: 'ytGaGIn3SjE',
  squat: 'ultWZbUMPL8',
  burpee: 'TU8QYVW0gDU',
  plank: 'pSHjTRCQxIw',
  'jumping-jacks': 'c4DAnQ6DtF8',
  'mountain-climbers': 'nmwgirgXLYM',
  lunges: 'QOVaHwm-Q6U',
};

const LOCAL_FALLBACK_EXERCISES: Exercise[] = exerciseLibrary.map(applyExerciseEnhancements);
const HYROX_FALLBACK_EXERCISES: Exercise[] = hyroxEventExercises.map(applyExerciseEnhancements);

type NormalizedFilters = {
  muscleGroups?: MuscleGroup[];
  equipment?: EquipmentType[];
  difficulty?: DifficultyLevel[];
  categories?: ExerciseCategory[];
  searchQuery?: string;
};

/** ---------- Utilities ---------- */

const toKey = (slug?: string | null, id?: string | null): string => {
  return (slug || id || '').toString().trim().toLowerCase();
};

const normalizeArray = <T extends string>(values?: (T | string)[] | null): T[] | undefined => {
  if (!values?.length) return undefined;
  const filtered = values
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .map((v) => v.trim()) as T[];
  return filtered.length ? filtered : undefined;
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
  if (!input) return {};
  const equipment = input.equipment ?? input.equipment_types;
  const difficulty = input.difficulty ?? input.difficulty_levels;
  const categories = input.category ?? input.category_ids;

  const normalizedSearch = (input.search_query ?? '').trim().toLowerCase();
  return {
    muscleGroups: normalizeArray<MuscleGroup>(input.muscle_groups),
    equipment: normalizeArray<EquipmentType>(equipment),
    difficulty: normalizeArray<DifficultyLevel>(difficulty),
    categories: normalizeArray<ExerciseCategory>(categories),
    searchQuery: normalizedSearch.length ? normalizedSearch : undefined,
  };
}

function matchesFilters(exercise: Exercise, filters: NormalizedFilters): boolean {
  const noFilters =
    !filters.muscleGroups?.length &&
    !filters.equipment?.length &&
    !filters.difficulty?.length &&
    !filters.categories?.length &&
    !filters.searchQuery;
  if (noFilters) return true;

  if (filters.muscleGroups?.length) {
    const muscles = [
      ...(Array.isArray(exercise.primary_muscles) ? exercise.primary_muscles : []),
      ...(Array.isArray(exercise.secondary_muscles) ? exercise.secondary_muscles : []),
    ] as MuscleGroup[];
    const muscleSet = new Set(muscles);
    if (!filters.muscleGroups.some((m) => muscleSet.has(m))) return false;
  }

  if (filters.equipment?.length) {
    const equip = (exercise.equipment ?? []) as EquipmentType[];
    const equipSet = new Set(equip);
    if (!filters.equipment.some((e) => equipSet.has(e))) return false;
  }

  if (filters.difficulty?.length) {
    if (!filters.difficulty.includes(exercise.difficulty as DifficultyLevel)) return false;
  }

  if (filters.categories?.length) {
    if (!exercise.category || !filters.categories.includes(exercise.category as ExerciseCategory)) {
      return false;
    }
  }

  if (filters.searchQuery) {
    const haystack = [
      exercise.name,
      exercise.description,
      ...(exercise.instructions || []),
      ...(((exercise.tags as string[]) ?? []) as string[]),
    ];
    const q = filters.searchQuery;
    const hit = haystack.some((v) => typeof v === 'string' && v.toLowerCase().includes(q));
    if (!hit) return false;
  }

  return true;
}

function dedupeBySlugOrId(exercises: Exercise[]): Exercise[] {
  const seen = new Set<string>();
  return exercises.filter((exercise) => {
    const key = toKey(exercise.slug, exercise.id);
    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeHyroxEventExercises(
  baseExercises: Exercise[],
  filters: NormalizedFilters
): Exercise[] {
  const seen = new Set<string>(baseExercises.map((ex) => toKey(ex.slug, ex.id)));
  const hyroxMatches = HYROX_FALLBACK_EXERCISES.filter((ex) => matchesFilters(ex, filters)).filter(
    (ex) => {
      const key = toKey(ex.slug, ex.id);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }
  );
  return hyroxMatches.length ? [...baseExercises, ...hyroxMatches] : baseExercises;
}

function buildFallbackExercises(filters: NormalizedFilters): Exercise[] {
  const localMatches = LOCAL_FALLBACK_EXERCISES.filter((ex) => matchesFilters(ex, filters));
  const dedupedLocal = dedupeBySlugOrId(localMatches);
  return mergeHyroxEventExercises(dedupedLocal, filters);
}

function paginateExercises(exercises: Exercise[], page: number, pageSize: number): Exercise[] {
  if (pageSize <= 0) return exercises;
  const start = Math.max(0, (page - 1) * pageSize);
  if (start >= exercises.length) return [];
  return exercises.slice(start, start + pageSize);
}

function formatExerciseResult(
  exercises: Exercise[],
  page: number,
  pageSize: number
): ExerciseSearchResult {
  const total = exercises.length;
  const paginated = paginateExercises(exercises, page, pageSize);
  return {
    exercises: paginated,
    total_count: total,
    filtered_count: paginated.length,
  };
}

function findFallbackExercise(identifier: string): Exercise | null {
  const key = (identifier || '').toLowerCase();
  if (!key) return null;
  const fallbackExercises = buildFallbackExercises({});
  return (
    fallbackExercises.find((exercise) => {
      const idKey = (exercise.id || '').toLowerCase();
      const slugKey = (exercise.slug || '').toLowerCase();
      return idKey === key || slugKey === key;
    }) || null
  );
}

/** Transform DB row -> frontend Exercise */
function transformExercise(exerciseDB: ExerciseDB): Exercise {
  const slugKey = (exerciseDB.slug || '').toLowerCase();
  const youtube_id = exerciseDB.youtube_id || (slugKey && TEMP_YOUTUBE_IDS[slugKey]) || null;

  return {
    id: exerciseDB.id,
    name: exerciseDB.name,
    slug: exerciseDB.slug || undefined,
    description: exerciseDB.description || '',
    instructions: exerciseDB.instructions || [],

    // Media
    image_url: exerciseDB.image_url || undefined,
    gif_url: exerciseDB.gif_url || undefined,
    video_url: exerciseDB.video_url || undefined,
    youtube_id,

    // Classification
    primary_muscles: (exerciseDB.primary_muscles || []) as MuscleGroup[],
    secondary_muscles: (exerciseDB.secondary_muscles || []) as MuscleGroup[],
    equipment: (exerciseDB.equipment || []) as EquipmentType[],
    difficulty: (exerciseDB.difficulty as DifficultyLevel) || 'beginner',
    category: (exerciseDB.category_id as ExerciseCategory) || undefined,

    // Environment
    environment: Array.isArray(exerciseDB.environment) ? exerciseDB.environment : [],

    // Exercise details
    force_type: exerciseDB.force_type || undefined,
    mechanics: exerciseDB.mechanics || undefined,

    // Additional info
    tips: exerciseDB.tips || [],
    common_mistakes: exerciseDB.common_mistakes || [],
    variations: exerciseDB.variations || [],
    contraindications: exerciseDB.contraindications || [],

    // Timestamps
    created_at: exerciseDB.created_at || null,
    updated_at: exerciseDB.updated_at || null,

    // Workout metadata
    calories_per_minute: exerciseDB.calories_per_minute ?? undefined,
    recommended_sets: exerciseDB.recommended_sets ?? undefined,
    recommended_reps: exerciseDB.recommended_reps ?? undefined,
    rest_time: exerciseDB.recommended_rest_seconds ?? undefined,

    // Search optimization
    tags: (exerciseDB.tags || []) as string[],
    popularity_score: exerciseDB.popularity_score ?? 0,
    is_featured: Boolean(exerciseDB.is_featured),
  };
}

/** ---------- Service ---------- */
export class ExerciseService {
  /** Get ALL exercises without pagination - for workout creator */
  static async getAllExercises(): Promise<Exercise[]> {
    console.log('🔄 Loading ALL exercises for workout creator...');
    try {
      const allExercises: Exercise[] = [];
      let fromIndex = 0;
      const batchSize = 1000;

      // Use a deterministic ordering to make paging-by-range stable.
      while (true) {
        // Order before range for stable pagination
        const { data: exercisesDB, error } = await supabase
          .from('exercises')
          .select('*')
          .eq('is_active', true)
          .eq('approval_status', 'approved')
          .order('created_at', { ascending: false })
          .range(fromIndex, fromIndex + batchSize - 1);

        if (error) {
          console.error('Error in batch fetch:', error);
          break; // fall back after loop
        }

        const rows = exercisesDB ?? [];
        if (rows.length === 0) break;

        const batch = rows.map(transformExercise).map(applyExerciseEnhancements);
        allExercises.push(...batch);

        console.log(
          `📦 Loaded batch ${fromIndex}-${fromIndex + rows.length - 1}, total: ${allExercises.length}`
        );

        if (rows.length < batchSize) break;
        fromIndex += batchSize;
      }

      const merged = mergeHyroxEventExercises(dedupeBySlugOrId(allExercises), {});
      console.log(`✅ Total exercises loaded: ${merged.length}`);
      return merged;
    } catch (error) {
      console.error('Failed to fetch all exercises:', error);
      return buildFallbackExercises({});
    }
  }

  /** Get exercises with optional filtering (paginated) */
  static async getExercises(
    filters?: ExerciseFilter & { page?: number; pageSize?: number }
  ): Promise<ExerciseSearchResult> {
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
        .eq('is_active', true)
        .eq('approval_status', 'approved')
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
      if (filters?.search_query?.trim()) {
        // lightweight search on name; server-side FTS could replace this
        query = query.ilike('name', `%${filters.search_query.trim()}%`);
      }

      const { data: exercisesDB, error, count } = await query;
      if (error) {
        console.error('Error fetching exercises:', error);
        const fallbackExercises = buildFallbackExercises(normalizedFilters);
        return formatExerciseResult(fallbackExercises, page, pageSize);
      }

      const baseExercises = (exercisesDB ?? [])
        .map(transformExercise)
        .map(applyExerciseEnhancements);

      if (!baseExercises.length) {
        const fallbackExercises = buildFallbackExercises(normalizedFilters);
        return formatExerciseResult(fallbackExercises, page, pageSize);
      }

      const merged = mergeHyroxEventExercises(baseExercises, normalizedFilters);
      const hyroxAdded = merged.length - baseExercises.length;
      const paginated = paginateExercises(merged, page, pageSize);

      return {
        exercises: paginated,
        total_count: typeof count === 'number' ? Math.max(0, count) + hyroxAdded : merged.length,
        filtered_count: paginated.length,
      };
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
      const fallbackExercises = buildFallbackExercises(normalizedFilters);
      return formatExerciseResult(fallbackExercises, page, pageSize);
    }
  }

  /** Advanced search with pagination and scoring (RPC) */
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
    const offset = Math.max(0, offset_count ?? 0);
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

      const baseExercises = (data ?? []).map(transformExercise).map(applyExerciseEnhancements);

      if (!baseExercises.length) {
        const fallbackExercises = buildFallbackExercises(normalizedFilters);
        return formatExerciseResult(fallbackExercises, page, limit);
      }

      const merged = mergeHyroxEventExercises(baseExercises, normalizedFilters);
      const hyroxAdded = merged.length - baseExercises.length;

      // Try to compute a more realistic total
      let totalCount = merged.length;
      try {
        const { count, error: countError } = await supabase
          .from('exercises')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .eq('approval_status', 'approved');

        if (!countError && typeof count === 'number') {
          totalCount = Math.max(0, count) + hyroxAdded;
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

  /** Get single exercise by ID or slug */
  static async getExercise(identifier: string): Promise<Exercise | null> {
    try {
      const id = (identifier || '').trim();
      if (!id) return findFallbackExercise(identifier);

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      let query = supabase
        .from('exercises')
        .select('*')
        .eq('is_active', true)
        .eq('approval_status', 'approved');

      query = isUUID ? query.eq('id', id) : query.eq('slug', id);

      const { data, error } = await query.single();

      if (error) {
        // PGRST116: No rows found
        if ((error as any).code === 'PGRST116') {
          return findFallbackExercise(identifier);
        }
        console.error('Error fetching exercise:', error);
        return findFallbackExercise(identifier);
      }

      return data
        ? applyExerciseEnhancements(transformExercise(data))
        : findFallbackExercise(identifier);
    } catch (error) {
      console.error('Failed to fetch exercise:', error);
      return findFallbackExercise(identifier);
    }
  }

  /** Featured exercises */
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

      if (error) throw error;

      return (exercisesDB ?? []).map(transformExercise).map(applyExerciseEnhancements);
    } catch (error) {
      console.error('Failed to fetch featured exercises:', error);
      return [];
    }
  }

  /** Exercises by muscle group */
  static async getExercisesByMuscleGroup(
    muscleGroup: MuscleGroup,
    limit: number = 20
  ): Promise<Exercise[]> {
    try {
      const { data: exercisesDB, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .contains('primary_muscles', [muscleGroup])
        .order('popularity_score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (exercisesDB ?? []).map(transformExercise).map(applyExerciseEnhancements);
    } catch (error) {
      console.error('Failed to fetch exercises by muscle group:', error);
      return [];
    }
  }

  /** Categories */
  static async getCategories(): Promise<ExerciseCategoryDB[]> {
    try {
      const { data, error } = await supabase.from('exercise_categories').select('*').order('name');

      if (error) throw error;
      return data ?? [];
    } catch (error) {
      console.error('Failed to fetch exercise categories:', error);
      return [];
    }
  }

  /** Admin: Create exercise */
  static async createExercise(exerciseData: CreateExerciseData): Promise<Exercise | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

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
          approval_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      return data ? transformExercise(data) : null;
    } catch (error) {
      console.error('Failed to create exercise:', error);
      return null;
    }
  }

  /** Admin: Update exercise */
  static async updateExercise(exerciseData: UpdateExerciseData): Promise<Exercise | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const { id, ...updateData } = exerciseData;

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
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data ? transformExercise(data) : null;
    } catch (error) {
      console.error('Failed to update exercise:', error);
      return null;
    }
  }

  /** Admin: Bulk import exercises */
  static async importExercises(exercises: ExerciseImportData[]): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const exercisesToInsert = exercises.map((exercise) => {
        const slug = exercise.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        return {
          name: exercise.name,
          slug,
          description: exercise.description || '',
          instructions: exercise.instructions || [],
          primary_muscles: exercise.muscle_groups || [],
          equipment: exercise.equipment || [],
          difficulty: (exercise.difficulty as DifficultyLevel) || 'beginner',
          tips: exercise.tips || [],
          variations: exercise.variations || [],
          // Keep tags simple and string[]; avoid nulls.
          tags: [exercise.name.toLowerCase(), ...(exercise.muscle_groups || [])],
          created_by: user.id,
          approval_status: 'pending',
        };
      });

      const { error } = await supabase.from('exercises').insert(exercisesToInsert);
      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Failed to import exercises:', error);
      return false;
    }
  }

  /** Popularity */
  static async updatePopularity(exerciseId: string): Promise<void> {
    try {
      await supabase.rpc('increment_exercise_popularity', {
        exercise_id: exerciseId,
      });
    } catch (error) {
      console.error('Failed to update exercise popularity:', error);
    }
  }
}
