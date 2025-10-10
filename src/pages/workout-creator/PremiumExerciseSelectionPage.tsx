import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Search,
  X,
  Dumbbell,
  Target,
  Filter,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Exercise, MuscleGroup, EquipmentType } from '../../types/exercise.types';
import { supabase } from '../../lib/supabase';
import { BottomSheet, useHaptic } from '../../components/ui/BottomSheet';
import { ExerciseImage } from '../../components/ui/ProgressiveImage';

// Muscle group icons mapping
const MUSCLE_ICONS: Record<string, string> = {
  chest: '💪',
  back: '🦾',
  shoulders: '🏋️',
  biceps: '💪',
  triceps: '💪',
  abs: '🎯',
  quadriceps: '🦵',
  hamstrings: '🦵',
  glutes: '🍑',
  calves: '🦵',
  full_body: '⚡',
};

const MUSCLE_GROUPS: { value: MuscleGroup; label: string }[] = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'abs', label: 'Core' },
  { value: 'quadriceps', label: 'Quads' },
  { value: 'hamstrings', label: 'Hamstrings' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'calves', label: 'Calves' },
  { value: 'full_body', label: 'Full Body' },
];

const EQUIPMENT_OPTIONS: { value: EquipmentType; label: string; icon: string }[] = [
  { value: 'bodyweight', label: 'Bodyweight', icon: '🤸' },
  { value: 'dumbbells', label: 'Dumbbells', icon: '🏋️' },
  { value: 'barbell', label: 'Barbell', icon: '🏋️' },
  { value: 'kettlebell', label: 'Kettlebell', icon: '⚫' },
  { value: 'resistance_bands', label: 'Bands', icon: '🎯' },
];

interface ExerciseCardProps {
  exercise: Exercise;
  isSelected: boolean;
  onToggle: (exercise: Exercise) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = React.memo(({ exercise, isSelected, onToggle }) => {
  const primaryMuscle = Array.isArray(exercise.primary_muscles) ? exercise.primary_muscles[0] : '';
  const equipment = Array.isArray(exercise.equipment) ? exercise.equipment[0] : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative"
    >
      <motion.button
        onClick={() => onToggle(exercise)}
        className={`w-full bg-gradient-to-br rounded-2xl overflow-hidden border-2 transition-all ${
          isSelected
            ? 'from-cyan-500/20 to-purple-600/20 border-cyan-400 shadow-lg shadow-cyan-500/25'
            : 'from-white/10 to-white/5 border-white/10 hover:border-white/20'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Image */}
        <div className="relative h-40 overflow-hidden">
          <ExerciseImage
            exercise={exercise}
            className="w-full h-full object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Selected Check */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </motion.div>
          )}

          {/* Difficulty Badge */}
          <div className="absolute top-2 left-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                exercise.difficulty === 'beginner'
                  ? 'bg-green-500/90 text-white'
                  : exercise.difficulty === 'intermediate'
                  ? 'bg-yellow-500/90 text-white'
                  : 'bg-red-500/90 text-white'
              }`}
            >
              {exercise.difficulty}
            </span>
          </div>

          {/* Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white font-bold text-sm line-clamp-2">{exercise.name}</h3>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 space-y-2">
          {/* Muscle + Equipment */}
          <div className="flex items-center gap-2 text-xs">
            {primaryMuscle && (
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg flex items-center gap-1">
                <Target className="w-3 h-3" />
                {primaryMuscle}
              </span>
            )}
            {equipment && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg flex items-center gap-1">
                <Dumbbell className="w-3 h-3" />
                {equipment}
              </span>
            )}
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
});

ExerciseCard.displayName = 'ExerciseCard';

export const PremiumExerciseSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const haptic = useHaptic();

  const initialSelected: Exercise[] = Array.isArray(location.state?.selectedExercises)
    ? location.state.selectedExercises
    : [];

  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>(initialSelected);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Load exercises
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .eq('is_active', true)
          .eq('approval_status', 'approved')
          .order('popularity_score', { ascending: false })
          .limit(1000);

        if (error) throw error;

        const mapped: Exercise[] = (data || []).map(
          (ex: any): Exercise => ({
            id: ex.id,
            slug: ex.slug,
            name: ex.name,
            description: ex.description || '',
            instructions: ex.instructions || [],
            image_url: ex.image_url,
            youtube_id: ex.youtube_id,
            primary_muscles: ex.primary_muscles || [],
            secondary_muscles: ex.secondary_muscles || [],
            equipment: ex.equipment || [],
            difficulty: ex.difficulty || 'beginner',
            category_id: ex.category_id,
            force_type: ex.force_type,
            mechanics: ex.mechanics,
            tips: ex.tips || [],
            common_mistakes: ex.common_mistakes || [],
            variations: ex.variations || [],
            contraindications: ex.contraindications || [],
            calories_per_minute: ex.calories_per_minute,
            recommended_sets: ex.recommended_sets,
            recommended_reps: ex.recommended_reps,
            recommended_rest_seconds: ex.recommended_rest_seconds,
            tags: ex.tags || [],
            is_active: ex.is_active,
            is_featured: ex.is_featured,
            popularity_score: ex.popularity_score || 0,
            created_by: ex.created_by,
            approved_by: ex.approved_by,
            approval_status: ex.approval_status,
            created_at: ex.created_at,
            updated_at: ex.updated_at,
          })
        );

        setAllExercises(mapped);
      } catch (err) {
        console.error('Error loading exercises:', err);
        toast.error('Failed to load exercises');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  // Filter exercises
  const filteredExercises = useMemo(() => {
    let filtered = allExercises;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.name?.toLowerCase().includes(q) ||
          ex.description?.toLowerCase().includes(q) ||
          (Array.isArray(ex.primary_muscles) &&
            ex.primary_muscles.some((m) => m.toLowerCase().includes(q)))
      );
    }

    // Muscle filter
    if (selectedMuscle) {
      filtered = filtered.filter(
        (ex) =>
          Array.isArray(ex.primary_muscles) &&
          ex.primary_muscles.includes(selectedMuscle as MuscleGroup)
      );
    }

    // Equipment filter
    if (selectedEquipment) {
      filtered = filtered.filter(
        (ex) =>
          Array.isArray(ex.equipment) &&
          ex.equipment.includes(selectedEquipment as EquipmentType)
      );
    }

    return filtered;
  }, [allExercises, search, selectedMuscle, selectedEquipment]);

  // Paginated exercises
  const paginatedExercises = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredExercises.slice(start, end);
  }, [filteredExercises, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredExercises.length / pageSize);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedMuscle, selectedEquipment]);

  const handleToggleExercise = useCallback(
    (exercise: Exercise) => {
      haptic.light();
      setSelectedExercises((prev) => {
        const isSelected = prev.some((ex) => ex.id === exercise.id);
        if (isSelected) {
          toast.success(`${exercise.name} removed`);
          return prev.filter((ex) => ex.id !== exercise.id);
        } else {
          toast.success(`${exercise.name} added`);
          return [...prev, exercise];
        }
      });
    },
    [haptic]
  );

  const handleDone = () => {
    haptic.medium();
    navigate('/modules/workout/workout-creator', {
      state: { selectedExercises },
      replace: true,
    });
  };

  const clearFilters = () => {
    setSelectedMuscle('');
    setSelectedEquipment('');
    setSearch('');
  };

  const activeFilterCount =
    (selectedMuscle ? 1 : 0) + (selectedEquipment ? 1 : 0) + (search ? 1 : 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading exercises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <div className="flex-1 text-center">
              <h1 className="text-lg font-bold text-white">Select Exercises</h1>
              <p className="text-xs text-white/60">{selectedExercises.length} selected</p>
            </div>

            <button
              onClick={() => {
                haptic.light();
                setShowFilters(true);
              }}
              className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/10"
            >
              <Filter className="w-5 h-5 text-white" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises..."
              className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-white/40" />
              </button>
            )}
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {selectedMuscle && (
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs flex items-center gap-1">
                  {MUSCLE_ICONS[selectedMuscle]} {selectedMuscle}
                  <button onClick={() => setSelectedMuscle('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedEquipment && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs flex items-center gap-1">
                  {selectedEquipment}
                  <button onClick={() => setSelectedEquipment('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="px-4 pt-6">
        <div className="mb-4 text-center">
          <p className="text-white/60 text-sm">
            Showing <span className="text-cyan-400 font-bold">{paginatedExercises.length}</span> of{' '}
            <span className="text-cyan-400 font-bold">{filteredExercises.length}</span> exercises
            {totalPages > 1 && (
              <span className="ml-2">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          {filteredExercises.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No exercises found</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-white text-sm"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {paginatedExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    isSelected={selectedExercises.some((ex) => ex.id === exercise.id)}
                    onToggle={handleToggleExercise}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(1, prev - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white/10 rounded-lg text-white font-semibold flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <span className="text-white font-bold">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white/10 rounded-lg text-white font-semibold flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      {selectedExercises.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent"
        >
          <button
            onClick={handleDone}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl text-white font-bold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
          >
            <Check className="w-6 h-6" />
            Done ({selectedExercises.length})
          </button>
        </motion.div>
      )}

      {/* Filter Bottom Sheet */}
      <BottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Exercises"
        height="auto"
      >
        <div className="space-y-6 pb-4">
          {/* Muscle Groups */}
          <div>
            <label className="block text-white font-medium mb-3">Target Muscle</label>
            <div className="grid grid-cols-2 gap-2">
              {MUSCLE_GROUPS.map((muscle) => (
                <button
                  key={muscle.value}
                  onClick={() => {
                    setSelectedMuscle(selectedMuscle === muscle.value ? '' : muscle.value);
                    haptic.light();
                  }}
                  className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                    selectedMuscle === muscle.value
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {MUSCLE_ICONS[muscle.value]} {muscle.label}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <label className="block text-white font-medium mb-3">Equipment</label>
            <div className="grid grid-cols-2 gap-2">
              {EQUIPMENT_OPTIONS.map((equip) => (
                <button
                  key={equip.value}
                  onClick={() => {
                    setSelectedEquipment(selectedEquipment === equip.value ? '' : equip.value);
                    haptic.light();
                  }}
                  className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                    selectedEquipment === equip.value
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {equip.icon} {equip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                clearFilters();
                setShowFilters(false);
                haptic.light();
              }}
              className="flex-1 py-3 bg-white/10 rounded-xl text-white font-semibold"
            >
              Clear All
            </button>
            <button
              onClick={() => {
                setShowFilters(false);
                haptic.medium();
              }}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-semibold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};