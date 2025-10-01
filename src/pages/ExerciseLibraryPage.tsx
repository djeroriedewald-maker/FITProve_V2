// src/pages/ExerciseLibraryPage.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Grid, List, Clock, Target, Dumbbell, Filter, ArrowLeft, Zap, Trophy, Activity } from "lucide-react";
import { motion } from "framer-motion";

import { useScrollToTop } from "../hooks/useScroll";
import { Exercise, MuscleGroup, EquipmentType, DifficultyLevel } from "../types/exercise.types";
import { supabase } from "../lib/supabase";
import { ExerciseDetailModal } from "../components/ui/ExerciseDetailModal";
import { ExerciseImage } from "../components/ui/ProgressiveImage";

import { GlassCard, GlassButton } from "../components/ui/GlassCard";
import { GlassInput } from "../components/ui/GlassInput";
import { FloatingElements, Glass3DCard, GlowEffect } from "../components/ui/Advanced3D";
import { BiometricRing } from "../components/ui/BiometricComponents";

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
  const difficultyConfig = {
    beginner: { color: "text-green-400", glow: "green", bg: "from-green-500/20" },
    intermediate: { color: "text-yellow-400", glow: "orange", bg: "from-yellow-500/20" },
    advanced: { color: "text-red-400", glow: "pink", bg: "from-red-500/20" },
  };

  const config = difficultyConfig[exercise.difficulty] || difficultyConfig.beginner;

  const primaryMuscles = useMemo(
    () => (Array.isArray(exercise.primary_muscles) ? exercise.primary_muscles.join(", ") : ""),
    [exercise.primary_muscles]
  );
  const equipment = useMemo(
    () => (Array.isArray(exercise.equipment) ? exercise.equipment.join(", ") : ""),
    [exercise.equipment]
  );

  const isHyrox = Array.isArray(exercise.tags) && exercise.tags.includes('hyrox');
  const hyroxMeta = isHyrox ? (exercise as any).event_metadata : null;

  function HyroxMetaSection({ meta }: { meta: any }) {
    if (!meta) return null;
    const station = meta.station;
    return (
      <div className="space-y-2">
        {station?.name && (
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-yellow-300">Station: {station.name}</span>
          </div>
        )}
        {station?.description && (
          <p className="text-yellow-200/80 text-sm">{station.description}</p>
        )}
        <div className="grid grid-cols-1 gap-2 text-xs">
          {station?.runDistanceBefore && (
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-200">Run Before: {station.runDistanceBefore}</span>
            </div>
          )}
          {station?.stationWork && (
            <div className="flex items-center gap-2">
              <Dumbbell className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-200">Work: {station.stationWork}</span>
            </div>
          )}
          {station?.primaryFocus && (
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-200">Focus: {station.primaryFocus.join(', ')}</span>
            </div>
          )}
        </div>
        {station?.officialResources && Array.isArray(station.officialResources) && (
          <div className="mt-3">
            <div className="font-medium text-yellow-300 mb-2 text-xs">Official Resources:</div>
            <div className="space-y-1">
              {station.officialResources.map((r: any) => (
                <a 
                  key={r.url} 
                  href={r.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block text-yellow-200 hover:text-yellow-100 underline text-xs transition-colors"
                >
                  {r.label}
                </a>
              ))}
            </div>
          </div>
        )}
        {station?.transitionNotes && Array.isArray(station.transitionNotes) && (
          <div className="text-yellow-200/70 text-xs">
            <strong>Transition:</strong> {station.transitionNotes.join(' ')}
          </div>
        )}
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 4 }}
        className={`${isHyrox ? 'border-yellow-400/50 shadow-yellow-400/20' : 'border-white/20'}`}
      >
        <GlowEffect color={config.glow as any} intensity="medium">
          <GlassCard 
            variant="workout" 
            className="cursor-pointer"
            onClick={() => onExerciseClick(exercise)}
            hover={true}
          >
            <div className="flex gap-4">
              <div className="relative flex-shrink-0">
                <ExerciseImage 
                  exercise={exercise} 
                  className="w-20 h-20 rounded-xl overflow-hidden" 
                  priority={false} 
                />
                {isHyrox && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-white text-lg">{exercise.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.color} bg-gradient-to-r ${config.bg} to-transparent border border-current/20`}>
                    {exercise.difficulty}
                  </span>
                </div>
                {!!exercise.description && (
                  <p className="text-white/70 text-sm mb-3 line-clamp-2">{exercise.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  {!!primaryMuscles && (
                    <div className="flex items-center gap-1 text-sm">
                      <Target className="w-4 h-4 text-cyan-400" />
                      <span className="text-white/80">{primaryMuscles}</span>
                    </div>
                  )}
                  {!!equipment && (
                    <div className="flex items-center gap-1 text-sm">
                      <Dumbbell className="w-4 h-4 text-purple-400" />
                      <span className="text-white/80">{equipment}</span>
                    </div>
                  )}
                  {!!exercise.recommended_reps && (
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <span className="text-white/80">{exercise.recommended_reps}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {isHyrox && hyroxMeta && (
              <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-sm">HYROX EVENT</span>
                </div>
                <HyroxMetaSection meta={hyroxMeta} />
              </div>
            )}
          </GlassCard>
        </GlowEffect>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <GlowEffect color={config.glow as any} intensity="medium">
        <div 
          className={`cursor-pointer overflow-hidden ${isHyrox ? 'border-yellow-400/50' : ''}`}
          onClick={() => onExerciseClick(exercise)}
        >
          <Glass3DCard 
            intensity="high" 
            depth={12}
          >
          <div className="relative h-48 overflow-hidden rounded-t-xl">
            <ExerciseImage 
              exercise={exercise} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
              priority={false} 
            />
            {/* Difficulty Badge */}
            <div className="absolute top-3 left-3">
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${config.color} bg-gradient-to-r ${config.bg} to-black/40 backdrop-blur-sm border border-current/30`}>
                {exercise.difficulty}
              </div>
            </div>
            {/* Hyrox Badge */}
            {isHyrox && (
              <div className="absolute top-3 right-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-neon-orange">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
          
          {/* Content Section */}
          <div className="p-6">
            <h3 className="font-bold text-white text-lg mb-2">{exercise.name}</h3>
            {!!exercise.description && (
              <p className="text-white/70 text-sm mb-4 line-clamp-2">{exercise.description}</p>
            )}
            
            {/* Exercise Details */}
            <div className="space-y-3 mb-4">
              {!!primaryMuscles && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-white/80 font-medium">{primaryMuscles}</span>
                </div>
              )}
              {!!equipment && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-white/80 font-medium">{equipment}</span>
                </div>
              )}
              {!!exercise.recommended_reps && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className="text-white/80 font-medium">{exercise.recommended_reps}</span>
                </div>
              )}
            </div>

            {/* Hyrox Special Section */}
            {isHyrox && hyroxMeta && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-sm">HYROX EVENT</span>
                </div>
                <HyroxMetaSection meta={hyroxMeta} />
              </div>
            )}
          </div>
          </Glass3DCard>
        </div>
      </GlowEffect>
    </motion.div>
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


  // Pagination (client-side)
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // --- YouTube Modal State ---
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);

  // Reset filters function
  const resetFilters = useCallback(() => {
    setSelectedEnvironment("");
    setSelectedMuscle("");
    setSelectedEquipment("");
    setSelectedDifficulty("");
    setSearch("");
    setPage(1);
  }, []);

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
      

    } catch (err) {
      console.error("Error loading exercises:", err);
      setAllExercises([]);
      setTotalCount(0);
      console.error("Failed to load exercises:", err);
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
      const tags = Array.isArray((ex as any).tags) ? (ex as any).tags.map((t: any) => t.toLowerCase()) : [];
      const equipment = Array.isArray(ex.equipment) ? ex.equipment.map(eq => eq.toLowerCase()) : [];
      
      // Hyrox check
      if (tags.includes('hyrox') || ex.name?.toLowerCase().includes('hyrox') || ex.description?.toLowerCase().includes('hyrox')) {
        counts.hyrox++;
      }
      // Outdoor check  
      else if (tags.some((tag: any) => ['outdoor', 'running', 'cycling', 'hiking', 'trail'].includes(tag)) ||
               ex.name?.toLowerCase().includes('outdoor') ||
               ex.name?.toLowerCase().includes('running')) {
        counts.outdoor++;
      }
      // Indoor/Home check
      else if (tags.includes('bodyweight') || equipment.includes('bodyweight') ||
               tags.some((tag: any) => ['home', 'indoor', 'bodyweight'].includes(tag)) ||
               (equipment.length === 1 && equipment[0] === 'bodyweight')) {
        counts.indoor++;
      }
      // Gym check (default for equipment-based exercises)
      else if (equipment.some(eq => ['barbell', 'dumbbell', 'cable', 'machine', 'bench'].includes(eq)) ||
               tags.some((tag: any) => ['barbell', 'dumbbell', 'cable', 'machine', 'bench', 'weights', 'gym'].includes(tag)) ||
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
          return tags.some((tag: any) => ['outdoor', 'running', 'cycling', 'hiking', 'trail'].includes(tag)) ||
                 ex.name?.toLowerCase().includes('outdoor') ||
                 ex.name?.toLowerCase().includes('running');
        } else if (env === 'indoor' || env === 'home') {
          return tags.includes('bodyweight') || 
                 equipment.includes('bodyweight') ||
                 tags.some((tag: any) => ['home', 'indoor', 'bodyweight'].includes(tag)) ||
                 (equipment.length === 1 && equipment[0] === 'bodyweight');
        } else if (env === 'gym') {
          // Gym exercises: equipment-based exercises (not bodyweight-only) or gym-related tags
          return equipment.some(eq => ['barbell', 'dumbbell', 'cable', 'machine', 'bench'].includes(eq)) ||
                 tags.some((tag: any) => ['barbell', 'dumbbell', 'cable', 'machine', 'bench', 'weights', 'gym'].includes(tag)) ||
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



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Advanced Background Effects */}
      <FloatingElements />
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <GlassButton
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </GlassButton>
          
          <GlassCard variant="hero" className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-neon-cyan">
                  <Dumbbell className="w-10 h-10 text-white" />
                </div>
                <BiometricRing
                  progress={Math.round((filteredCount / totalCount) * 100) || 0}
                  size={100}
                  color="#06b6d4"
                  strokeWidth={4}
                />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent mb-4">
              Exercise Library
            </h1>
            <div className="flex items-center justify-center gap-6 text-white/70">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{totalCount}</div>
                <div className="text-sm">Total Exercises</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{filteredCount}</div>
                <div className="text-sm">Filtered Results</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{Object.keys(environmentCounts).length}</div>
                <div className="text-sm">Categories</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Search & Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <GlassCard>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-semibold">Search Exercises</span>
                </div>
                <GlassInput
                  type="text"
                  placeholder="Search by name, muscle group, or equipment..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Grid className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-semibold">View Mode</span>
                </div>
                <div className="flex rounded-xl border border-white/20 bg-white/5 p-1">
                  <GlassButton
                    variant={viewMode === "grid" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="flex-1"
                  >
                    <Grid className="w-4 h-4 mr-2" />
                    Grid
                  </GlassButton>
                  <GlassButton
                    variant={viewMode === "list" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="flex-1"
                  >
                    <List className="w-4 h-4 mr-2" />
                    List
                  </GlassButton>
                </div>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-3 mt-6 mb-4">
              <Filter className="w-5 h-5 text-orange-400" />
              <span className="text-white font-semibold">Filters</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Environment Filter */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Environment</label>
                <select
                  className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white backdrop-blur-xl focus:border-cyan-400 focus:outline-none transition-colors"
                  value={selectedEnvironment}
                  onChange={(e) => setSelectedEnvironment(e.target.value)}
                >
                  <option value="" className="bg-gray-800 text-white">All Environments ({totalCount})</option>
                  <option value="Gym" className="bg-gray-800 text-white">🏋️ Gym ({environmentCounts.gym || 0})</option>
                  <option value="Indoor" className="bg-gray-800 text-white">🏠 Indoor ({environmentCounts.indoor || 0})</option>
                  <option value="Outdoor" className="bg-gray-800 text-white">🌲 Outdoor ({environmentCounts.outdoor || 0})</option>
                  <option value="Hyrox" className="bg-gray-800 text-white">🏃 Hyrox ({environmentCounts.hyrox || 0})</option>
                </select>
              </div>

              {/* Muscle Group Filter */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Muscle Group</label>
                <select
                  className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white backdrop-blur-xl focus:border-purple-400 focus:outline-none transition-colors"
                  value={selectedMuscle}
                  onChange={(e) => setSelectedMuscle(e.target.value)}
                >
                  <option value="" className="bg-gray-800 text-white">All Muscles</option>
                  {muscleGroupOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-gray-800 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Equipment Filter */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Equipment</label>
                <select
                  className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white backdrop-blur-xl focus:border-orange-400 focus:outline-none transition-colors"
                  value={selectedEquipment}
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                >
                  <option value="" className="bg-gray-800 text-white">All Equipment</option>
                  {equipmentOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-gray-800 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Difficulty</label>
                <select
                  className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white backdrop-blur-xl focus:border-pink-400 focus:outline-none transition-colors"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <option value="" className="bg-gray-800 text-white">All Levels</option>
                  {difficultyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-gray-800 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <GlassButton
                  variant="secondary"
                  onClick={resetFilters}
                  className="w-full"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Reset All
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Exercise Statistics */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6"
        >
          <GlassCard className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-cyan-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Exercise Library Stats
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <BiometricRing 
                  progress={totalCount > 0 ? (exercises.length / totalCount) * 100 : 0} 
                  color="#06b6d4" 
                  size={60} 
                />
                <div className="mt-3">
                  <div className="text-2xl font-bold text-cyan-400">{exercises.length}</div>
                  <div className="text-white/70">Showing</div>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <BiometricRing 
                  progress={totalCount > 0 ? (filteredCount / totalCount) * 100 : 0} 
                  color="#a855f7" 
                  size={60} 
                />
                <div className="mt-3">
                  <div className="text-2xl font-bold text-purple-400">{filteredCount}</div>
                  <div className="text-white/70">Filtered</div>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <BiometricRing 
                  progress={100} 
                  color="#f97316" 
                  size={60} 
                />
                <div className="mt-3">
                  <div className="text-2xl font-bold text-orange-400">{totalCount}</div>
                  <div className="text-white/70">Total</div>
                </div>
              </div>
            </div>
            
            {filteredCount !== totalCount && (
              <div className="mt-4 px-4 py-2 bg-orange-500/20 border border-orange-400/30 rounded-lg">
                <span className="text-orange-400 text-sm">
                  Filters applied - showing {((filteredCount / totalCount) * 100).toFixed(1)}% of total exercises
                </span>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Exercise Grid/List Display */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {loading ? (
            <GlassCard className="text-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                <span className="text-white/80">Loading amazing exercises...</span>
              </div>
            </GlassCard>
          ) : exercises.length === 0 ? (
            <GlassCard className="text-center py-16">
              <div className="flex flex-col items-center gap-4">
                <Target className="w-16 h-16 text-white/40" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">No exercises found</h3>
                  <p className="text-white/70">Try adjusting your filters to see more results</p>
                </div>
                <GlassButton onClick={resetFilters} variant="secondary">
                  Reset Filters
                </GlassButton>
              </div>
            </GlassCard>
          ) : (
            <>
              <div
                className={`grid ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "grid-cols-1 gap-4"
                } w-full`}
              >
                {exercises.map((exercise, index) => (
                  <motion.div
                    key={exercise.id ?? exercise.slug ?? exercise.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ExerciseCard
                      exercise={exercise}
                      viewMode={viewMode}
                      onExerciseClick={handleExerciseClick}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Enhanced Pagination */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-12"
              >
                <GlassCard className="flex justify-center">
                  <div className="flex items-center gap-4">
                    <GlassButton
                      variant="secondary"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      size="sm"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </GlassButton>
                    
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                      <span className="text-white font-semibold">{page}</span>
                      <span className="text-white/60">of</span>
                      <span className="text-white font-semibold">{Math.max(1, Math.ceil(totalCount / pageSize))}</span>
                    </div>
                    
                    <GlassButton
                      variant="secondary"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= Math.ceil(totalCount / pageSize)}
                      size="sm"
                    >
                      Next
                      <Zap className="w-4 h-4 ml-2" />
                    </GlassButton>
                  </div>
                </GlassCard>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Detail Modal */}
        <ExerciseDetailModal
          exercise={selectedExercise}
          isOpen={showModal}
          onClose={handleCloseModal}
          onWatchVideo={handleWatchVideo}
          isYouTubeModalOpen={isYouTubeModalOpen}
          setIsYouTubeModalOpen={setIsYouTubeModalOpen}
        />

        {/* Enhanced Back to Top */}
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={handleBackToTop}
            className="fixed bottom-28 right-4 sm:right-8 z-50 p-4 rounded-full bg-gradient-to-br from-cyan-500/80 to-purple-600/80 backdrop-blur-xl border border-white/20 text-white shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 group"
            aria-label="Back to top"
          >
            <ArrowLeft className="w-5 h-5 rotate-90 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </div>

      {/* Background Elements */}
      <FloatingElements />
    </div>
  );
}
