import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Grid,
  List,
  ArrowLeft,
  Check,
  Filter,
  X,
  Target,
  Dumbbell,
  Activity,
  Trophy,
  ChevronDown,
  Plus,
  Shuffle,
  Eye,
  Play,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useScrollToTop } from '../../hooks/useScroll';
import { Exercise, MuscleGroup, EquipmentType, DifficultyLevel } from '../../types/exercise.types';
import { supabase } from '../../lib/supabase';
import { ExerciseDetailModal } from '../../components/ui/ExerciseDetailModal';
import { ExerciseImage } from '../../components/ui/ProgressiveImage';

// 3D Components
const ParticleSystem: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = ['#00E5FF', '#B400FF', '#FF6B35'];

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
};

const Glass3DCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
}> = ({ children, className = '', selected = false, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl
        ${
          selected
            ? 'bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border-2 border-cyan-400/50'
            : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-cyan-400/30'
        }
        backdrop-blur-xl shadow-2xl transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      whileHover={onClick ? { scale: 1.02, rotateY: 2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      style={{
        background: selected
          ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      }}
    >
      {children}

      {/* Glow effect */}
      {selected && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-600/20 blur-xl -z-10" />
      )}
    </motion.div>
  );
};

const FloatingElement: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: [0, -10, 0],
      }}
      transition={{
        opacity: { duration: 0.6, delay },
        y: {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        },
      }}
    >
      {children}
    </motion.div>
  );
};

// Filter Options
const muscleGroupOptions: { value: MuscleGroup; label: string; icon: string }[] = [
  { value: 'chest', label: 'Chest', icon: '💪' },
  { value: 'back', label: 'Back', icon: '🔙' },
  { value: 'shoulders', label: 'Shoulders', icon: '🤲' },
  { value: 'biceps', label: 'Biceps', icon: '💪' },
  { value: 'triceps', label: 'Triceps', icon: '🔥' },
  { value: 'abs', label: 'Abs', icon: '⚡' },
  { value: 'quadriceps', label: 'Quadriceps', icon: '🦵' },
  { value: 'hamstrings', label: 'Hamstrings', icon: '🦵' },
  { value: 'glutes', label: 'Glutes', icon: '🍑' },
  { value: 'calves', label: 'Calves', icon: '🦵' },
  { value: 'full_body', label: 'Full Body', icon: '🏃' },
];

const equipmentOptions: { value: EquipmentType; label: string; icon: string }[] = [
  { value: 'bodyweight', label: 'Bodyweight', icon: '🏃' },
  { value: 'dumbbells', label: 'Dumbbells', icon: '🏋️' },
  { value: 'barbell', label: 'Barbell', icon: '🏋️' },
  { value: 'kettlebell', label: 'Kettlebell', icon: '⚡' },
  { value: 'resistance_bands', label: 'Resistance Bands', icon: '🔄' },
  { value: 'pull_up_bar', label: 'Pull-up Bar', icon: '🔗' },
  { value: 'bench', label: 'Bench', icon: '🪑' },
];

const difficultyOptions: { value: DifficultyLevel; label: string; color: string }[] = [
  { value: 'beginner', label: 'Beginner', color: 'from-green-400 to-green-600' },
  { value: 'intermediate', label: 'Intermediate', color: 'from-yellow-400 to-orange-500' },
  { value: 'advanced', label: 'Advanced', color: 'from-red-500 to-purple-600' },
];

const environmentOptions = [
  { value: 'gym', label: '🏋️ Gym', icon: '🏋️' },
  { value: 'home', label: '🏠 Home', icon: '🏠' },
  { value: 'outdoor', label: '🌲 Outdoor', icon: '🌲' },
  { value: 'hyrox', label: '🏃 Hyrox', icon: '🏃' },
];

// Enhanced Filter Component
interface FilterDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; icon?: string; color?: string }>;
  icon?: React.ElementType;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <motion.div ref={dropdownRef} className="relative" style={{ zIndex: isOpen ? 99999 : 50 }}>
      <Glass3DCard className="p-3" selected={isOpen}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-white"
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-cyan-400" />}
            <span className="text-sm font-medium">
              {selectedOption ? selectedOption.label : `All ${label}`}
            </span>
          </div>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-white/60" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-gray-900/98 backdrop-blur-xl border-2 border-cyan-400/50 rounded-lg overflow-hidden shadow-2xl max-h-80 overflow-y-auto"
              style={{
                zIndex: 99999,
                position: 'absolute',
                backgroundColor: 'rgba(17, 24, 39, 0.98)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <button
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-white hover:bg-cyan-500/20 transition-colors border-b border-gray-700/50"
              >
                All {label}
              </button>
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-white hover:bg-cyan-500/20 transition-colors border-b border-gray-700/50 last:border-b-0 flex items-center gap-3"
                  style={{
                    backgroundColor:
                      option.value === value ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                  }}
                >
                  {option.icon && <span className="text-lg">{option.icon}</span>}
                  <span>{option.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Glass3DCard>
    </motion.div>
  );
};

// Enhanced Exercise Card Component
interface ExerciseCard3DProps {
  exercise: Exercise;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  viewMode: 'grid' | 'list';
}

const ExerciseCard3D: React.FC<ExerciseCard3DProps> = ({
  exercise,
  isSelected,
  onSelect,
  onView,
  viewMode,
}) => {
  const difficultyColor =
    difficultyOptions.find((d) => d.value === exercise.difficulty)?.color ||
    'from-gray-400 to-gray-600';

  const primaryMuscles = Array.isArray(exercise.primary_muscles)
    ? exercise.primary_muscles.join(', ')
    : exercise.primary_muscles || '';
  const equipment = Array.isArray(exercise.equipment)
    ? exercise.equipment.join(', ')
    : exercise.equipment || '';

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.02, rotateY: 2 }}
        className="mb-4"
      >
        <Glass3DCard className="p-4" selected={isSelected}>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden">
              <ExerciseImage
                exercise={exercise}
                className="w-full h-full object-cover"
                priority={false}
              />
              {isSelected && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-bold text-white mb-2 line-clamp-2">
                {exercise.name}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-white/70 mb-2">
                <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded">
                  <Target className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" />
                  <span className="truncate">{primaryMuscles || 'Multiple'}</span>
                </div>
                <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded">
                  <Dumbbell className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
                  <span className="truncate">{equipment || 'Various'}</span>
                </div>
                <div
                  className={`px-2 py-1 rounded-full bg-gradient-to-r ${difficultyColor} text-white text-xs font-medium w-fit`}
                >
                  {exercise.difficulty}
                </div>
              </div>
              {exercise.description && (
                <p className="text-white/60 text-xs md:text-sm line-clamp-2">
                  {exercise.description}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
              <motion.button
                onClick={onView}
                className="px-3 md:px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:from-cyan-600 hover:to-blue-700 transition-all text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-4 h-4" />
                View
              </motion.button>

              <motion.button
                onClick={onSelect}
                className={`px-3 md:px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-sm ${
                  isSelected
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSelected ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </Glass3DCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      whileHover={{ scale: 1.05, rotateY: 5 }}
      className="group"
    >
      <Glass3DCard className="overflow-hidden" selected={isSelected}>
        <div className="relative h-48">
          <ExerciseImage
            exercise={exercise}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            priority={false}
          />

          {/* Mobile-first Always Visible Buttons */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
            <div className="absolute bottom-2 left-2 right-2 flex gap-2">
              <motion.button
                onClick={onView}
                className="flex-1 px-3 py-2 bg-cyan-500/90 backdrop-blur-sm text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">View</span>
              </motion.button>

              <motion.button
                onClick={onSelect}
                className={`flex-1 px-3 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-sm shadow-lg ${
                  isSelected
                    ? 'bg-green-500/90 text-white'
                    : 'bg-purple-500/90 text-white hover:bg-purple-600/90'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSelected ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Difficulty Badge */}
          <div className="absolute top-4 left-4">
            <div
              className={`px-3 py-1 rounded-full bg-gradient-to-r ${difficultyColor} text-white text-xs font-medium backdrop-blur-sm`}
            >
              {exercise.difficulty}
            </div>
          </div>

          {/* Selection Indicator */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Check className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </div>

        {/* Mobile-optimized Exercise Info */}
        <div className="p-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent backdrop-blur-sm">
          <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-tight drop-shadow-lg line-clamp-2">
            {exercise.name || 'Unnamed Exercise'}
          </h3>

          <div className="space-y-1 text-xs md:text-sm">
            <div className="flex items-center gap-2 text-cyan-100 bg-black/40 px-2 py-1 rounded">
              <Target className="w-3 h-3 md:w-4 md:h-4 text-cyan-400 flex-shrink-0" />
              <span className="font-medium truncate">{primaryMuscles || 'Multiple muscles'}</span>
            </div>

            <div className="flex items-center gap-2 text-purple-100 bg-black/40 px-2 py-1 rounded">
              <Dumbbell className="w-3 h-3 md:w-4 md:h-4 text-purple-400 flex-shrink-0" />
              <span className="font-medium truncate">{equipment || 'Various equipment'}</span>
            </div>

            {exercise.youtube_id && (
              <div className="flex items-center gap-2 text-red-100 bg-black/40 px-2 py-1 rounded">
                <Play className="w-3 h-3 md:w-4 md:h-4 text-red-400 flex-shrink-0" />
                <span className="font-medium">Video</span>
              </div>
            )}
          </div>
        </div>
      </Glass3DCard>
    </motion.div>
  );
};

// Main Enhanced Exercise Selection Page
export function EnhancedExerciseSelectionPage() {
  useScrollToTop();
  const navigate = useNavigate();
  const location = useLocation();

  const initialSelectedExercises = location.state?.selectedExercises || [];

  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>(initialSelectedExercises);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState('');

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Stats
  const [totalCount, setTotalCount] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const EXERCISES_PER_PAGE = 25;

  // Load exercises
  useEffect(() => {
    loadExercises();
  }, []);

  // Filter exercises when filters change
  useEffect(() => {
    filterExercises();
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    allExercises,
    search,
    selectedMuscle,
    selectedEquipment,
    selectedDifficulty,
    selectedEnvironment,
  ]);

  const loadExercises = async () => {
    try {
      setLoading(true);

      // Get total count first
      const { count } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setTotalCount(count || 0);

      // Get exercises data
      const { data, error: fetchError } = await supabase
        .from('exercises')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (fetchError) throw fetchError;

      // Map the database response to the Exercise interface
      const mappedExercises: Exercise[] = (data || []).map((exercise: any) => ({
        id: exercise.id,
        name: exercise.name,
        slug: exercise.slug || `${exercise.name.toLowerCase().replace(/\s+/g, '-')}`,
        description: exercise.description || '',
        instructions: exercise.instructions || [],
        image_url: exercise.image_url || exercise.media_url,
        gif_url: exercise.gif_url,
        video_url: exercise.video_url,
        youtube_id: exercise.youtube_id,
        primary_muscles: exercise.primary_muscles || [exercise.primary_muscle].filter(Boolean),
        secondary_muscles: exercise.secondary_muscles || [],
        equipment: [exercise.equipment].filter(Boolean),
        difficulty: exercise.difficulty || 'intermediate',
        category: exercise.category,
        environment: exercise.environment,
        force_type: exercise.force_type,
        mechanics: exercise.mechanics,
        tips: exercise.tips || [],
        common_mistakes: exercise.common_mistakes || [],
        variations: exercise.variations || [],
        contraindications: exercise.contraindications || [],
        created_at: exercise.created_at,
        updated_at: exercise.updated_at || exercise.created_at,
        calories_per_minute: exercise.calories_per_minute,
        recommended_sets: exercise.recommended_sets,
        recommended_reps: exercise.recommended_reps,
        rest_time: exercise.rest_time,
        tags: exercise.tags || [],
        popularity_score: exercise.popularity_score || 0,
        is_featured: exercise.is_featured || false,
      }));
      setAllExercises(mappedExercises);
    } catch (err) {
      console.error('Error loading exercises:', err);
      setError('Failed to load exercises');
      toast.error('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = useCallback(() => {
    console.log('Filtering exercises with:', {
      search,
      selectedMuscle,
      selectedEquipment,
      selectedDifficulty,
      selectedEnvironment,
      totalExercises: allExercises.length,
    });

    let filtered = [...allExercises];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.name.toLowerCase().includes(searchLower) ||
          ex.description?.toLowerCase().includes(searchLower)
      );
      console.log(`After search filter: ${filtered.length} exercises`);
    }

    // Muscle group filter
    if (selectedMuscle) {
      filtered = filtered.filter(
        (ex) =>
          Array.isArray(ex.primary_muscles) &&
          ex.primary_muscles.includes(selectedMuscle as MuscleGroup)
      );
      console.log(`After muscle filter (${selectedMuscle}): ${filtered.length} exercises`);
    }

    // Equipment filter
    if (selectedEquipment) {
      filtered = filtered.filter(
        (ex) =>
          Array.isArray(ex.equipment) && ex.equipment.includes(selectedEquipment as EquipmentType)
      );
      console.log(`After equipment filter (${selectedEquipment}): ${filtered.length} exercises`);
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter((ex) => ex.difficulty === selectedDifficulty);
      console.log(`After difficulty filter (${selectedDifficulty}): ${filtered.length} exercises`);
    }

    // Environment filter
    if (selectedEnvironment) {
      const envLower = selectedEnvironment.toLowerCase();
      filtered = filtered.filter((ex) => {
        const tags = Array.isArray((ex as any).tags) ? (ex as any).tags : [];
        return tags.some((tag: string) => tag.toLowerCase().includes(envLower));
      });
      console.log(
        `After environment filter (${selectedEnvironment}): ${filtered.length} exercises`
      );
    }

    console.log(`Final filtered count: ${filtered.length} exercises`);
    setFilteredExercises(filtered);
  }, [
    allExercises,
    search,
    selectedMuscle,
    selectedEquipment,
    selectedDifficulty,
    selectedEnvironment,
  ]);

  // Get paginated exercises
  const paginatedExercises = React.useMemo(() => {
    const startIndex = (currentPage - 1) * EXERCISES_PER_PAGE;
    return filteredExercises.slice(startIndex, startIndex + EXERCISES_PER_PAGE);
  }, [filteredExercises, currentPage]);

  const totalPages = React.useMemo(
    () => Math.ceil(filteredExercises.length / EXERCISES_PER_PAGE),
    [filteredExercises.length]
  );

  const handleExerciseSelect = (exercise: Exercise) => {
    const isSelected = selectedExercises.some((ex) => ex.id === exercise.id);

    if (isSelected) {
      setSelectedExercises((prev) => prev.filter((ex) => ex.id !== exercise.id));
    } else {
      setSelectedExercises((prev) => [...prev, exercise]);
    }
  };

  const handleFinishSelection = () => {
    console.log('Finishing selection with exercises:', selectedExercises.length);
    selectedExercises.forEach((ex, i) => {
      console.log(`Exercise ${i + 1}:`, {
        id: ex.id,
        name: ex.name,
        hasAllData: !!(ex.id && ex.name && ex.primary_muscles),
      });
    });
    navigate('/modules/workout/workout-creator', {
      state: { selectedExercises },
    });
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedMuscle('');
    setSelectedEquipment('');
    setSelectedDifficulty('');
    setSelectedEnvironment('');
  };

  const addRandomExercises = () => {
    const unselected = filteredExercises.filter(
      (ex) => !selectedExercises.some((sel) => sel.id === ex.id)
    );

    const random = unselected
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(5, unselected.length));

    setSelectedExercises((prev) => [...prev, ...random]);
    toast.success(`Added ${random.length} random exercises!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-white text-lg">Loading exercises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Particle System */}
      <ParticleSystem />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20 py-4">
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={() => navigate('/modules/workout/workout-creator')}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Creator
                </motion.button>

                <div className="hidden sm:block w-px h-6 bg-gray-600"></div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-white">Exercise Library</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {selectedExercises.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg"
                  >
                    <span className="text-white font-medium">
                      {selectedExercises.length} selected
                    </span>
                  </motion.div>
                )}

                <motion.button
                  onClick={handleFinishSelection}
                  disabled={selectedExercises.length === 0}
                  className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                    selectedExercises.length > 0
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  whileHover={selectedExercises.length > 0 ? { scale: 1.05 } : {}}
                  whileTap={selectedExercises.length > 0 ? { scale: 0.95 } : {}}
                >
                  <Check className="w-4 h-4" />
                  Done ({selectedExercises.length})
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Glass3DCard className="p-6">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all text-lg"
                />
              </div>

              {/* Mobile-optimized Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <motion.button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium text-sm min-h-[44px]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden xs:inline">Filters</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                    />
                  </motion.button>

                  <motion.button
                    onClick={addRandomExercises}
                    disabled={filteredExercises.length === 0}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm min-h-[44px]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Shuffle className="w-4 h-4" />
                    <span className="hidden xs:inline">Add 5 Random</span>
                    <span className="xs:hidden">+5</span>
                  </motion.button>
                </div>

                <div className="flex items-center gap-2 justify-center sm:justify-end">
                  <motion.button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-lg transition-all min-h-[44px] min-w-[44px] ${
                      viewMode === 'grid'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white/10 text-gray-400 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Grid className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-lg transition-all min-h-[44px] min-w-[44px] ${
                      viewMode === 'list'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white/10 text-gray-400 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <List className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Filters Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10"
                    style={{ position: 'relative', zIndex: 1000 }}
                  >
                    <FilterDropdown
                      label="Muscles"
                      value={selectedMuscle}
                      onChange={(value) => {
                        console.log('Muscle filter changed:', value);
                        setSelectedMuscle(value);
                      }}
                      options={muscleGroupOptions.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                        icon: opt.icon,
                      }))}
                      icon={Target}
                    />

                    <FilterDropdown
                      label="Equipment"
                      value={selectedEquipment}
                      onChange={(value) => {
                        console.log('Equipment filter changed:', value);
                        setSelectedEquipment(value);
                      }}
                      options={equipmentOptions.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                        icon: opt.icon,
                      }))}
                      icon={Dumbbell}
                    />

                    <FilterDropdown
                      label="Difficulty"
                      value={selectedDifficulty}
                      onChange={setSelectedDifficulty}
                      options={difficultyOptions.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                        color: opt.color,
                      }))}
                      icon={Trophy}
                    />

                    <FilterDropdown
                      label="Environment"
                      value={selectedEnvironment}
                      onChange={setSelectedEnvironment}
                      options={environmentOptions.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                        icon: opt.icon,
                      }))}
                      icon={Activity}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Filters & Stats */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-cyan-300 bg-cyan-500/10 px-3 py-2 rounded-lg">
                  <Activity className="w-4 h-4" />
                  <span className="font-medium text-sm">
                    Showing {paginatedExercises.length} of {filteredExercises.length} exercises (
                    {totalCount} total)
                  </span>
                </div>

                {(search ||
                  selectedMuscle ||
                  selectedEquipment ||
                  selectedDifficulty ||
                  selectedEnvironment) && (
                  <motion.button
                    onClick={clearAllFilters}
                    className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-3 h-3" />
                    Clear Filters
                  </motion.button>
                )}
              </div>
            </Glass3DCard>
          </motion.div>

          {/* Exercise Grid/List */}
          {filteredExercises.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <FloatingElement>
                <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-white/40" />
                </div>
              </FloatingElement>
              <h3 className="text-2xl font-bold text-white/60 mb-3">No exercises found</h3>
              <p className="text-white/40 mb-6">Try adjusting your search or filters</p>
              <motion.button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear All Filters
              </motion.button>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
                    : 'space-y-3'
                }
              >
                <AnimatePresence mode="popLayout">
                  {paginatedExercises.map((exercise, index) => (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <ExerciseCard3D
                        exercise={exercise}
                        isSelected={selectedExercises.some((ex) => ex.id === exercise.id)}
                        onSelect={() => handleExerciseSelect(exercise)}
                        onView={() => setSelectedExercise(exercise)}
                        viewMode={viewMode}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center items-center gap-2 mt-8"
                >
                  <motion.button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                    whileHover={{ scale: currentPage > 1 ? 1.05 : 1 }}
                    whileTap={{ scale: currentPage > 1 ? 0.95 : 1 }}
                  >
                    Previous
                  </motion.button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else {
                        const start = Math.max(1, currentPage - 2);
                        const end = Math.min(totalPages, start + 4);
                        pageNum = start + i;
                        if (pageNum > end) return null;
                      }

                      return (
                        <motion.button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                              : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {pageNum}
                        </motion.button>
                      );
                    })}
                  </div>

                  <motion.button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                    whileHover={{ scale: currentPage < totalPages ? 1.05 : 1 }}
                    whileTap={{ scale: currentPage < totalPages ? 0.95 : 1 }}
                  >
                    Next
                  </motion.button>

                  <div className="ml-4 text-white/60 text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          isOpen={!!selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onWatchVideo={(exercise) => {
            // Handle video watching
            console.log('Watch video for:', exercise.name);
          }}
          isYouTubeModalOpen={false}
          setIsYouTubeModalOpen={() => {}}
        />
      )}
    </div>
  );
}
