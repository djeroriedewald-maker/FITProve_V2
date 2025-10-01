// src/pages/workout-creator/ExerciseSelectionPage.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Grid, List, Clock, Target, Dumbbell, ArrowLeft, Check } from "lucide-react";
import { toast } from 'react-hot-toast';

import { useScrollToTop } from "../../hooks/useScroll";
import { Exercise, MuscleGroup, EquipmentType, DifficultyLevel } from "../../types/exercise.types";
import { supabase } from "../../lib/supabase";
import { ExerciseDetailModal } from "../../components/ui/ExerciseDetailModal";
import { ExerciseImage } from "../../components/ui/ProgressiveImage";

/** --- Options (label/value pairs kept in sync with type unions) --- */
const muscleGroupOptions: { value: MuscleGroup; label: string }[] = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "biceps", label: "Biceps" },
  { value: "triceps", label: "Triceps" },
  { value: "abs", label: "Abs" },
  { value: "quadriceps", label: "Quadriceps" },
  { value: "hamstrings", label: "Hamstrings" },
  { value: "glutes", label: "Glutes" },
  { value: "calves", label: "Calves" },
  { value: "full_body", label: "Full Body" },
];

const equipmentOptions: { value: EquipmentType; label: string }[] = [
  { value: "bodyweight", label: "Bodyweight" },
  { value: "dumbbells", label: "Dumbbells" },
  { value: "barbell", label: "Barbell" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "resistance_bands", label: "Resistance Bands" },
  { value: "pull_up_bar", label: "Pull-up Bar" },
  { value: "bench", label: "Bench" },
  { value: "ski_erg", label: "SkiErg" },
  { value: "sled", label: "Sled" },
  { value: "sandbag", label: "Sandbag" },
  { value: "wall_ball", label: "Wall Ball" },
];

const difficultyOptions: { value: DifficultyLevel; label: string; color: string }[] = [
  { value: "beginner", label: "Beginner", color: "text-green-600" },
  { value: "intermediate", label: "Intermediate", color: "text-yellow-600" },
  { value: "advanced", label: "Advanced", color: "text-red-600" },
];

/** --- Cards --- */
interface ExerciseCardProps {
  exercise: Exercise;
  viewMode: "grid" | "list";
  onExerciseClick: (exercise: Exercise) => void;
  onAddToWorkout: (exercise: Exercise) => void;
  isSelected: boolean;
}

function ExerciseCard({ exercise, viewMode, onExerciseClick, onAddToWorkout, isSelected }: ExerciseCardProps) {
  const difficultyColor =
    difficultyOptions.find((d) => d.value === exercise.difficulty)?.color || "text-gray-600";

  const primaryMuscles = useMemo(
    () => (Array.isArray(exercise.primary_muscles) ? exercise.primary_muscles.join(", ") : ""),
    [exercise.primary_muscles]
  );

  const equipment = useMemo(
    () => (Array.isArray(exercise.equipment) ? exercise.equipment.join(", ") : ""),
    [exercise.equipment]
  );

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger exercise detail modal if clicking the Add button
    if ((e.target as HTMLElement).closest('.add-to-workout-btn')) {
      return;
    }
    onExerciseClick(exercise);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWorkout(exercise);
  };

  if (viewMode === "list") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 cursor-pointer border-l-4 border-transparent hover:border-orange-500"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onExerciseClick(exercise)}>
        <div className="flex gap-4">
          <ExerciseImage exercise={exercise} className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden" priority={false} />
          <div className="flex-grow">
            <div className="flex items-start justify-between">
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{exercise.name}</h3>
                {!!exercise.description && <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">{exercise.description}</p>}
              </div>
              <button
                onClick={handleAddClick}
                className={`add-to-workout-btn ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check className="w-4 h-4 inline mr-1" />
                    Added
                  </>
                ) : (
                  'Add to Workout'
                )}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/90 ${difficultyColor}`}>{exercise.difficulty}</span>
              {!!primaryMuscles && <span className="text-xs text-gray-500 dark:text-gray-400">{primaryMuscles}</span>}
              {!!equipment && <span className="text-xs text-gray-500 dark:text-gray-400">{equipment}</span>}
              {!!exercise.recommended_reps && <span className="text-xs text-gray-500 dark:text-gray-400">{exercise.recommended_reps}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onExerciseClick(exercise)}>
      <div className="relative h-48 overflow-hidden">
        <ExerciseImage exercise={exercise} className="w-full h-full group-hover:scale-105 transition-transform duration-200" priority={false} />
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/90 ${difficultyColor}`}>{exercise.difficulty}</span>
        </div>
        {isSelected && (
          <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">{exercise.name}</h3>
        {!!exercise.description && <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{exercise.description}</p>}
        <div className="space-y-2 mb-4">
          {!!primaryMuscles && <div className="flex items-center gap-1 text-sm"><Target className="w-4 h-4 text-gray-500" /><span className="text-gray-600 dark:text-gray-400">{primaryMuscles}</span></div>}
          {!!equipment && <div className="flex items-center gap-1 text-sm"><Dumbbell className="w-4 h-4 text-gray-500" /><span className="text-gray-600 dark:text-gray-400">{equipment}</span></div>}
          {!!exercise.recommended_reps && <div className="flex items-center gap-1 text-sm"><Clock className="w-4 h-4 text-gray-500" /><span className="text-gray-600 dark:text-gray-400">{exercise.recommended_reps}</span></div>}
        </div>
        <button
          onClick={handleAddClick}
          className={`add-to-workout-btn w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isSelected
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          {isSelected ? (
            <>
              <Check className="w-4 h-4 inline mr-1" />
              Added
            </>
          ) : (
            'Add to Workout'
          )}
        </button>
      </div>
    </div>
  );
}

/** --- Main Page --- */
export function ExerciseSelectionPage() {
  useScrollToTop();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get selected exercises from navigation state
  const initialSelectedExercises = location.state?.selectedExercises || [];
  
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>(initialSelectedExercises);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [environmentCounts, setEnvironmentCounts] = useState<{[key: string]: number}>({});

  // Filters & search - using single value dropdowns like ExerciseLibraryPage
  const [search, setSearch] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedEnvironment, setSelectedEnvironment] = useState("");

  // View & pagination
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const pageSize = 20;

  /** Calculate environment counts */
  const calculateEnvironmentCounts = useCallback((exerciseList: Exercise[]) => {
    const counts = {
      gym: 0,
      indoor: 0,
      outdoor: 0,
      hyrox: 0
    };

    exerciseList.forEach((ex) => {
      const tags = Array.isArray((ex as any).tags) ? (ex as any).tags.map(t => t.toLowerCase()) : [];
      const equipment = Array.isArray(ex.equipment) ? ex.equipment.map(eq => eq.toLowerCase()) : [];
      
      // Hyrox check
      if (tags.includes('hyrox') || ex.name?.toLowerCase().includes('hyrox') || ex.description?.toLowerCase().includes('hyrox')) {
        counts.hyrox++;
      }
      // Outdoor check  
      else if (tags.some(tag => ['outdoor', 'running', 'cycling', 'hiking', 'trail'].includes(tag)) ||
               ex.name?.toLowerCase().includes('outdoor') ||
               ex.name?.toLowerCase().includes('running')) {
        counts.outdoor++;
      }
      // Indoor/Home check
      else if (tags.includes('bodyweight') || equipment.includes('bodyweight') ||
               tags.some(tag => ['home', 'indoor', 'bodyweight'].includes(tag)) ||
               (equipment.length === 1 && equipment[0] === 'bodyweight')) {
        counts.indoor++;
      }
      // Gym check (default for equipment-based exercises)
      else if (equipment.some(eq => ['barbell', 'dumbbell', 'cable', 'machine', 'bench'].includes(eq)) ||
               tags.some(tag => ['barbell', 'dumbbell', 'cable', 'machine', 'bench', 'weights', 'gym'].includes(tag)) ||
               (equipment.length > 0 && !equipment.every(eq => eq === 'bodyweight'))) {
        counts.gym++;
      }
    });

    return counts;
  }, []);

  // Load all exercises using range-based batching to avoid Supabase row limit
  const fetchAllExercises = useCallback(async () => {
    setLoading(true);
    try {
      const batchSize = 1000;
      let fromIndex = 0;
      let allResults: Exercise[] = [];
      let keepFetching = true;
      
      console.log('🔄 Fetching ALL exercises from Supabase (single source of truth)...');
      
      // Use range-based batching instead of page-based
      while (keepFetching) {
        const toIndex = fromIndex + batchSize - 1;
        console.log(`📦 Fetching range ${fromIndex}-${toIndex}`);
        
        // Direct Supabase query with range
        const { data, error, count } = await supabase
          .from('exercises')
          .select('*', { count: 'exact' })
          .eq('is_active', true)
          .eq('approval_status', 'approved')
          .range(fromIndex, toIndex)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching exercises:', error);
          throw error;
        }
        
        const exercises = (data || []).map((exercise: any) => ({
          id: exercise.id || exercise.slug,
          slug: exercise.slug,
          name: exercise.name,
          description: exercise.description || '',
          instructions: exercise.instructions || [],
          image_url: exercise.image_url,
          youtube_id: exercise.youtube_id,
          primary_muscles: exercise.primary_muscles || [],
          secondary_muscles: exercise.secondary_muscles || [],
          equipment: exercise.equipment || [],
          difficulty: exercise.difficulty || 'beginner',
          category_id: exercise.category_id,
          force_type: exercise.force_type,
          mechanics: exercise.mechanics,
          tips: exercise.tips || [],
          common_mistakes: exercise.common_mistakes || [],
          variations: exercise.variations || [],
          contraindications: exercise.contraindications || [],
          calories_per_minute: exercise.calories_per_minute,
          recommended_sets: exercise.recommended_sets,
          recommended_reps: exercise.recommended_reps,
          recommended_rest_seconds: exercise.recommended_rest_seconds,
          tags: exercise.tags || [],
          is_active: exercise.is_active,
          is_featured: exercise.is_featured,
          popularity_score: exercise.popularity_score || 0,
          created_by: exercise.created_by,
          approved_by: exercise.approved_by,
          approval_status: exercise.approval_status,
          created_at: exercise.created_at,
          updated_at: exercise.updated_at,
        }));
        
        console.log(`✅ Range ${fromIndex}-${toIndex}: got ${exercises.length} exercises, total_count: ${count}`);
        
        allResults = allResults.concat(exercises);
        
        // Stop when we get less than batchSize results
        if (exercises.length < batchSize) {
          keepFetching = false;
          console.log(`🛑 Stopping: got ${exercises.length} exercises in range ${fromIndex}-${toIndex}`);
        } else {
          fromIndex = toIndex + 1; // Move to next range
        }
      }
      
      console.log(`🎉 Finished fetching all ranges. Total exercises: ${allResults.length}`);
      
      // Defensive: filter out duplicates by id (shouldn't happen, but just in case)
      const dedupedResults = Array.from(new Map(allResults.map((ex) => [ex.id, ex])).values());
      
      console.log(`📊 After deduplication: ${dedupedResults.length} unique exercises`);
      
      setAllExercises(dedupedResults);
      setTotalCount(dedupedResults.length);
      
      // Calculate environment counts
      const counts = calculateEnvironmentCounts(dedupedResults);
      setEnvironmentCounts(counts);
      
      setError(null);
    } catch (err) {
      console.error("Error loading exercises:", err);
      setAllExercises([]);
      setTotalCount(0);
      setError("Failed to load exercises. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  /** Client-side filtering & pagination - same logic as ExerciseLibraryPage */
  const applyFilters = useCallback(() => {
    const q = search.trim().toLowerCase();

    let filtered = allExercises;

    // difficulty
    if (selectedDifficulty) {
      filtered = filtered.filter((ex) => ex.difficulty === (selectedDifficulty as DifficultyLevel));
    }

    // muscle group
    if (selectedMuscle) {
      filtered = filtered.filter((ex) =>
        Array.isArray(ex.primary_muscles)
          ? ex.primary_muscles.includes(selectedMuscle as MuscleGroup)
          : false
      );
    }

    // equipment — match exact type tag OR fuzzy search in name/description
    if (selectedEquipment) {
      const equipmentLower = selectedEquipment.toLowerCase();
      filtered = filtered.filter((ex) => {
        const hasTag =
          Array.isArray(ex.equipment) && ex.equipment.includes(selectedEquipment as EquipmentType);
        const nameMatch = ex.name?.toLowerCase().includes(equipmentLower);
        const descMatch = ex.description?.toLowerCase().includes(equipmentLower);
        return hasTag || nameMatch || descMatch;
      });
    }

    // environment (Gym, Indoor, Outdoor, Hyrox) - all from Supabase now
    if (selectedEnvironment) {
      const env = selectedEnvironment.toLowerCase();
      filtered = filtered.filter((ex) => {
        // Check environment array on record
        if (Array.isArray((ex as any).environment)) {
          const hit = (ex as any).environment.some(
            (e: unknown) => typeof e === "string" && e.toLowerCase() === env
          );
          if (hit) return true;
        }
        
        // Enhanced environment filtering based on existing tags and equipment
        const tags = Array.isArray((ex as any).tags)
          ? (ex as any).tags.map((t: unknown) => (typeof t === "string" ? t.toLowerCase() : ""))
          : [];
        const equipment = Array.isArray(ex.equipment) ? ex.equipment.map(eq => eq.toLowerCase()) : [];
        
        // Environment-specific logic
        if (env === 'hyrox') {
          return tags.includes('hyrox') || 
                 ex.name?.toLowerCase().includes('hyrox') ||
                 ex.description?.toLowerCase().includes('hyrox');
        } else if (env === 'outdoor') {
          return tags.some(tag => ['outdoor', 'running', 'cycling', 'hiking', 'trail'].includes(tag)) ||
                 ex.name?.toLowerCase().includes('outdoor') ||
                 ex.name?.toLowerCase().includes('running');
        } else if (env === 'indoor' || env === 'home') {
          return tags.includes('bodyweight') || 
                 equipment.includes('bodyweight') ||
                 tags.some(tag => ['home', 'indoor', 'bodyweight'].includes(tag));
        } else if (env === 'gym') {
          // Gym exercises: anything with equipment (not bodyweight-only) or gym-related tags
          return equipment.some(eq => ['barbell', 'dumbbell', 'cable', 'machine', 'bench'].includes(eq)) ||
                 tags.some(tag => ['barbell', 'dumbbell', 'cable', 'machine', 'bench', 'weights', 'gym'].includes(tag)) ||
                 (!equipment.includes('bodyweight') && equipment.length > 0);
        }
        
        // Fallback: direct tag/name/description match
        return tags.includes(env) || 
               ex.name?.toLowerCase().includes(env) || 
               ex.description?.toLowerCase().includes(env);
      });
    }

    // text search
    if (q) {
      filtered = filtered.filter((ex) => {
        const inName = ex.name?.toLowerCase().includes(q);
        const inDesc = ex.description?.toLowerCase().includes(q);
        const inMuscles = Array.isArray(ex.primary_muscles)
          ? ex.primary_muscles.join(" ").toLowerCase().includes(q)
          : false;
        const inEquip = Array.isArray(ex.equipment)
          ? ex.equipment.join(" ").toLowerCase().includes(q)
          : false;
        return inName || inDesc || inMuscles || inEquip;
      });
    }

    // Pagination slice
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    setExercises(filtered.slice(start, end));
    setTotalCount(filtered.length); // Update total count with filtered results
  }, [
    allExercises,
    page,
    pageSize,
    search,
    selectedDifficulty,
    selectedMuscle,
    selectedEquipment,
    selectedEnvironment,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedMuscle, selectedEquipment, selectedDifficulty, selectedEnvironment]);

  // Fetch on mount
  useEffect(() => {
    fetchAllExercises();
  }, [fetchAllExercises]);

  // Apply filters when data/page/filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleAddToWorkout = useCallback((exercise: Exercise) => {
    setSelectedExercises(prev => {
      const isAlreadySelected = prev.some(ex => ex.id === exercise.id);
      if (isAlreadySelected) {
        // Remove from selection
        const updated = prev.filter(ex => ex.id !== exercise.id);
        toast.success(`${exercise.name} removed from selection`);
        return updated;
      } else {
        // Add to selection
        const updated = [...prev, exercise];
        toast.success(`${exercise.name} added to workout`);
        return updated;
      }
    });
  }, []);

  const handleFinishSelection = () => {
    // Navigate back to workout creator with selected exercises
    navigate('/modules/workout/workout-creator', {
      state: { selectedExercises },
      replace: true
    });
  };

  const isExerciseSelected = (exerciseId: string) => {
    return selectedExercises.some(ex => ex.id === exerciseId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/modules/workout/workout-creator')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Workout Creator
              </button>
              <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Exercise Library
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedExercises.length} selected
              </span>
              {selectedExercises.length > 0 && (
                <button
                  onClick={handleFinishSelection}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Add {selectedExercises.length} Exercise{selectedExercises.length > 1 ? 's' : ''} to Workout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls - Same as ExerciseLibraryPage */}
        <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 mb-6 w-full">
          <div className="flex flex-col xs:flex-row flex-1 gap-2 w-full">
            <div className="relative w-full">
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search exercises"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex gap-2 w-full justify-end">
              <button
                className={`p-2 rounded-lg border ${
                  viewMode === "grid"
                    ? "bg-orange-100 border-orange-400 text-orange-600"
                    : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-500"
                }`}
                onClick={() => setViewMode("grid")}
                title="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                className={`p-2 rounded-lg border ${
                  viewMode === "list"
                    ? "bg-orange-100 border-orange-400 text-orange-600"
                    : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-500"
                }`}
                onClick={() => setViewMode("list")}
                title="List view"
                aria-pressed={viewMode === "list"}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row gap-2 w-full md:w-auto">
            <select
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white w-full md:w-auto"
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
              aria-label="Filter by environment"
            >
              <option value="">All Environments ({totalCount})</option>
              <option value="Gym">🏋️ Gym ({environmentCounts.gym || 0})</option>
              <option value="Indoor">🏠 Indoor ({environmentCounts.indoor || 0})</option>
              <option value="Outdoor">🌲 Outdoor ({environmentCounts.outdoor || 0})</option>
              <option value="Hyrox">🏃 Hyrox ({environmentCounts.hyrox || 0})</option>
            </select>
            <select
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white w-full md:w-auto"
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              aria-label="Filter by muscle group"
            >
              <option value="">All Muscles</option>
              {muscleGroupOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white w-full md:w-auto"
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              aria-label="Filter by equipment"
            >
              <option value="">All Equipment</option>
              {equipmentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white w-full md:w-auto"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              aria-label="Filter by difficulty"
            >
              <option value="">All Levels</option>
              {difficultyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="text-sm text-gray-900 dark:text-white mb-2 text-center">
          Showing{" "}
          <span className="font-semibold text-orange-600 dark:text-orange-400">{exercises.length}</span>{" "}
          exercises out of{" "}
          <span className="font-semibold text-orange-600 dark:text-orange-400">{totalCount}</span>
        </div>

        {/* Grid/List */}
        {loading ? (
          <div className="text-center py-12 text-gray-700 dark:text-gray-300">Loading...</div>
        ) : exercises.length === 0 ? (
          <div className="text-gray-700 dark:text-gray-300 text-center py-12">No exercises found.</div>
        ) : (
          <>
            <div
              className={`grid ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
                  : "grid-cols-1 gap-2 md:gap-4"
              } w-full`}
            >
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id ?? exercise.slug ?? exercise.name}
                  exercise={exercise}
                  viewMode={viewMode}
                  onExerciseClick={setSelectedExercise}
                  onAddToWorkout={handleAddToWorkout}
                  isSelected={isExerciseSelected(exercise.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {Math.ceil(totalCount / pageSize) > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Page {page} of {Math.ceil(totalCount / pageSize)}
                </span>
                <button
                  className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                  onClick={() => setPage(prev => Math.min(Math.ceil(totalCount / pageSize), prev + 1))}
                  disabled={page >= Math.ceil(totalCount / pageSize)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          isOpen={!!selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onWatchVideo={() => {}}
          isYouTubeModalOpen={false}
          setIsYouTubeModalOpen={() => {}}
        />
      )}
    </div>
  );
}