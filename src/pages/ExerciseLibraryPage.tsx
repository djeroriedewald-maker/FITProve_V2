// src/pages/ExerciseLibraryPage.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Grid, List, Clock, Target, Dumbbell } from "lucide-react";

import { useScrollToTop } from "../hooks/useScroll";
import { Exercise, MuscleGroup, EquipmentType, DifficultyLevel } from "../types/exercise.types";
import { supabase } from "../lib/supabase";
import { ExerciseDetailModal } from "../components/ui/ExerciseDetailModal";
import { ExerciseImage } from "../components/ui/ProgressiveImage";
import { hyroxEventExercises } from '../data/events/hyroxEventExercises';

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
}

function ExerciseCard({ exercise, viewMode, onExerciseClick }: ExerciseCardProps) {
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

  const isHyrox = Array.isArray(exercise.tags) && exercise.tags.includes('hyrox');
  const hyroxBorder = isHyrox ? 'border-4 border-yellow-400' : 'border border-gray-200 dark:border-gray-700';
  const hyroxMeta = isHyrox ? exercise.event_metadata : null;

  function HyroxMetaSection({ meta }: { meta: any }) {
    if (!meta) return null;
    const station = meta.station;
    return (
      <div className="mt-2 border-t-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 rounded-b-lg p-3">
        <h4 className="text-lg font-bold text-yellow-600 mb-1">HYROX Event Details</h4>
        {station?.name && <div className="font-semibold text-yellow-700">Station: {station.name}</div>}
        {station?.description && <div className="text-sm text-yellow-800 mb-2">{station.description}</div>}
        {station?.runDistanceBefore && <div className="text-xs text-yellow-700">Run Before: {station.runDistanceBefore}</div>}
        {station?.stationWork && <div className="text-xs text-yellow-700">Work: {station.stationWork}</div>}
        {station?.primaryFocus && <div className="text-xs text-yellow-700">Focus: {station.primaryFocus.join(', ')}</div>}
        {station?.officialResources && Array.isArray(station.officialResources) && (
          <div className="mt-2">
            <div className="font-semibold text-yellow-700 mb-1">Official Resources:</div>
            <ul className="list-disc ml-4 text-xs text-yellow-700">
              {station.officialResources.map((r: any) => (
                <li key={r.url}><a href={r.url} target="_blank" rel="noopener noreferrer" className="underline text-yellow-700">{r.label}</a></li>
              ))}
            </ul>
          </div>
        )}
        {station?.transitionNotes && Array.isArray(station.transitionNotes) && (
          <div className="mt-2 text-xs text-yellow-700">Transition: {station.transitionNotes.join(' ')}</div>
        )}
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 cursor-pointer ${hyroxBorder}`}
        onClick={() => onExerciseClick(exercise)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onExerciseClick(exercise)}>
        <div className="flex gap-4">
          <ExerciseImage exercise={exercise} className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden" priority={false} />
          <div className="flex-grow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{exercise.name}</h3>
                {!!exercise.description && <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">{exercise.description}</p>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/90 ${difficultyColor}`}>{exercise.difficulty}</span>
              {!!primaryMuscles && <span className="text-xs text-gray-500 dark:text-gray-400">{primaryMuscles}</span>}
              {!!equipment && <span className="text-xs text-gray-500 dark:text-gray-400">{equipment}</span>}
              {!!exercise.recommended_reps && <span className="text-xs text-gray-500 dark:text-gray-400">{exercise.recommended_reps}</span>}
            </div>
          </div>
        </div>
  {/* Hyrox details only in detail view, not overview */}
      </div>
    );
  }

  // Grid view
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer ${hyroxBorder}`}
      onClick={() => onExerciseClick(exercise)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onExerciseClick(exercise)}>
      <div className="relative h-48 overflow-hidden">
        <ExerciseImage exercise={exercise} className="w-full h-full group-hover:scale-105 transition-transform duration-200" priority={false} />
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/90 ${difficultyColor}`}>{exercise.difficulty}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">{exercise.name}</h3>
        {!!exercise.description && <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{exercise.description}</p>}
        <div className="space-y-2 mb-4">
          {!!primaryMuscles && <div className="flex items-center gap-1 text-sm"><Target className="w-4 h-4 text-gray-500" /><span className="text-gray-600 dark:text-gray-400">{primaryMuscles}</span></div>}
          {!!equipment && <div className="flex items-center gap-1 text-sm"><Dumbbell className="w-4 h-4 text-gray-500" /><span className="text-gray-600 dark:text-gray-400">{equipment}</span></div>}
          {!!exercise.recommended_reps && <div className="flex items-center gap-1 text-sm"><Clock className="w-4 h-4 text-gray-500" /><span className="text-gray-600 dark:text-gray-400">{exercise.recommended_reps}</span></div>}
        </div>
      </div>
  {/* Hyrox details only in detail view, not overview */}
    </div>
  );
}

/** --- Page --- */
export function ExerciseLibraryPage() {
  useScrollToTop();
  const navigate = useNavigate();

  // Data
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [environmentCounts, setEnvironmentCounts] = useState<{[key: string]: number}>({});

  // UI state
  const [search, setSearch] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination (client-side)
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // --- YouTube Modal State ---
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);

  /** Fetch all exercises using batched approach to get around Supabase limits */
  const fetchAllExercises = useCallback(async () => {
    setLoading(true);
    try {
      let allResults: Exercise[] = [];
      let fromIndex = 0;
      const batchSize = 1000; // Supabase max row limit per query
      let keepFetching = true;
      
      console.log('🚀 Starting to fetch all exercises using batched approach...');
      
      while (keepFetching) {
        const toIndex = fromIndex + batchSize - 1;
        console.log(`📥 Fetching range ${fromIndex}-${toIndex}...`);
        
        const { data: exercises, error, count } = await supabase
          .from('exercises')
          .select('*', { count: 'exact' })
          .eq('is_active', true)
          .range(fromIndex, toIndex);
          
        if (error) {
          console.error('❌ Error in batch query:', error);
          throw error;
        }
        
        if (!exercises) {
          console.log('⚠️ No exercises returned in this batch');
          break;
        }
        
        // Transform the exercises to match our Exercise interface
        const transformedExercises = exercises.map((exercise: any): Exercise => ({
          id: exercise.id,
          name: exercise.name,
          slug: exercise.slug,
          description: exercise.description,
          image_url: exercise.image_url,
          youtube_url: exercise.youtube_url,
          instructions: exercise.instructions || [],
          primary_muscles: exercise.primary_muscles || [],
          secondary_muscles: exercise.secondary_muscles || [],
          equipment: exercise.equipment || [],
          difficulty: exercise.difficulty,
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
        
        allResults = allResults.concat(transformedExercises);
        
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
      setFilteredCount(dedupedResults.length); // Initially, filtered count equals total
      
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

  /** Client-side filtering & pagination */
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

    // environment (Gym, Indoor, Outdoor, Hyrox) - Smart filtering logic
    if (selectedEnvironment) {
      const env = selectedEnvironment.toLowerCase();
      filtered = filtered.filter((ex) => {
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
                 tags.some(tag => ['home', 'indoor', 'bodyweight'].includes(tag)) ||
                 (equipment.length === 1 && equipment[0] === 'bodyweight');
        } else if (env === 'gym') {
          // Gym exercises: equipment-based exercises (not bodyweight-only) or gym-related tags
          return equipment.some(eq => ['barbell', 'dumbbell', 'cable', 'machine', 'bench'].includes(eq)) ||
                 tags.some(tag => ['barbell', 'dumbbell', 'cable', 'machine', 'bench', 'weights', 'gym'].includes(tag)) ||
                 (equipment.length > 0 && !equipment.every(eq => eq === 'bodyweight'));
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
    setFilteredCount(filtered.length); // Track filtered count for display
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

  // Back-to-top visibility
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /** Handlers */
  const handleExerciseClick = (exercise: Exercise) => {
    navigate(`/exercise/${exercise.id ?? exercise.slug ?? exercise.name}`);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedExercise(null);
  };
  const handleBackToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  function handleWatchVideo(exercise: Exercise) {
    setSelectedExercise(exercise);
    setIsYouTubeModalOpen(true);
  }

  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));

  return (
    <div className="p-2 sm:p-4 max-w-5xl mx-auto w-full overflow-x-hidden">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Go back"
      >
        <span className="text-xl">←</span> Back
      </button>

      {/* Hero */}
      <div className="relative left-1/2 right-1/2 -translate-x-1/2 w-screen h-48 sm:h-64 md:h-80 overflow-hidden mb-6">
        <img
          src="/images/exercise_library_1.webp"
          alt="Exercise Library Hero"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "top" }}
          loading="eager"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white text-center drop-shadow-lg">
            Exercise Library
          </h1>
        </div>
      </div>

      {/* Controls */}
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
        <span className="font-semibold text-orange-600 dark:text-orange-400">{filteredCount}</span>
        {filteredCount !== totalCount && (
          <span className="text-gray-500 text-xs ml-1">
            (filtered from {totalCount} total)
          </span>
        )}
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
                onExerciseClick={handleExerciseClick}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}
            </span>
            <button
              className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(totalCount / pageSize)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Detail Modal */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        isOpen={showModal}
        onClose={handleCloseModal}
        onWatchVideo={handleWatchVideo}
        isYouTubeModalOpen={isYouTubeModalOpen}
        setIsYouTubeModalOpen={setIsYouTubeModalOpen}
      />

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={handleBackToTop}
          className="fixed bottom-28 right-4 sm:right-8 z-50 p-3 rounded-full bg-orange-600 text-white shadow-lg hover:bg-orange-700 transition-colors"
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </div>
  );
}
