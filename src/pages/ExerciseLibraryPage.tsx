import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid, List, Clock, Target, Dumbbell } from 'lucide-react';
import { Exercise, MuscleGroup, EquipmentType, DifficultyLevel } from '../types/exercise.types';
import { ExerciseService } from '../lib/exercise.service';
import { ExerciseDetailModal } from '../components/ui/ExerciseDetailModal';
import { ExerciseImage } from '../components/ui/ProgressiveImage';

export function ExerciseLibraryPage() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchExercises = async () => {
    setLoading(true);
    // Always fetch all exercises for client-side filtering
    const filters = {
      muscle_groups: selectedMuscle ? [selectedMuscle as MuscleGroup] : undefined,
      difficulty: selectedDifficulty ? [selectedDifficulty as DifficultyLevel] : undefined,
      search_query: search || undefined,
      page: 1, // always fetch from first page to get all results
      pageSize: 2000, // large enough to get all exercises
    };
    const result = await ExerciseService.getExercises(filters);
    let filtered = result.exercises;
    if (selectedEquipment) {
      const equipmentLower = selectedEquipment.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          (ex.equipment && ex.equipment.includes(selectedEquipment as EquipmentType)) ||
          (ex.name && ex.name.toLowerCase().includes(equipmentLower)) ||
          (ex.description && ex.description.toLowerCase().includes(equipmentLower))
      );
    }
    // Pagination client-side
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setExercises(filtered.slice(start, end));
    setTotalCount(result.total_count);
    setLoading(false);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedMuscle, selectedEquipment, selectedDifficulty]);

  useEffect(() => {
    fetchExercises();
    // eslint-disable-next-line
  }, [search, selectedMuscle, selectedEquipment, selectedDifficulty, page]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedExercise(null);
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- YouTube Modal State ---
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);

  function handleWatchVideo(exercise: Exercise) {
    setSelectedExercise(exercise);
    setIsYouTubeModalOpen(true);
  }

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
      {/* Hero Section */}
      <div className="relative left-1/2 right-1/2 -translate-x-1/2 w-screen h-48 sm:h-64 md:h-80 overflow-hidden mb-6">
        <img
          src="/images/exercise_library.webp"
          alt="Exercise Library Hero"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white text-center drop-shadow-lg">
            Exercise Library
          </h1>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 mb-6 w-full">
        <div className="flex flex-col xs:flex-row flex-1 gap-2 w-full">
          <div className="relative w-full">
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex gap-2 w-full justify-end">
            <button
              className={`p-2 rounded-lg border ${viewMode === 'grid' ? 'bg-orange-100 border-orange-400 text-orange-600' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-500'}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-lg border ${viewMode === 'list' ? 'bg-orange-100 border-orange-400 text-orange-600' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-500'}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 w-full md:w-auto">
          <select
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white w-full md:w-auto"
            value={selectedMuscle}
            onChange={(e) => setSelectedMuscle(e.target.value)}
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
      {/* Exercise count summary */}
      <div className="text-sm text-gray-900 dark:text-white mb-2 text-center">
        Showing{' '}
        <span className="font-semibold text-orange-600 dark:text-orange-400">
          {exercises.length}
        </span>{' '}
        exercises out of{' '}
        <span className="font-semibold text-orange-600 dark:text-orange-400">{totalCount}</span>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-700 dark:text-gray-300">Loading...</div>
      ) : exercises.length === 0 ? (
        <div className="text-gray-700 dark:text-gray-300 text-center py-12">
          No exercises found.
        </div>
      ) : (
        <>
          <div
            className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6' : 'grid-cols-1 gap-2 md:gap-4'} w-full`}
          >
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                viewMode={viewMode}
                onExerciseClick={handleExerciseClick}
              />
            ))}
          </div>
          {/* Pagination Controls */}
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

      <ExerciseDetailModal
        exercise={selectedExercise}
        isOpen={showModal}
        onClose={handleCloseModal}
        onWatchVideo={handleWatchVideo}
        isYouTubeModalOpen={isYouTubeModalOpen}
        setIsYouTubeModalOpen={setIsYouTubeModalOpen}
      />
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

const muscleGroupOptions: { value: MuscleGroup; label: string }[] = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'abs', label: 'Abs' },
  { value: 'quadriceps', label: 'Quadriceps' },
  { value: 'hamstrings', label: 'Hamstrings' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'calves', label: 'Calves' },
  { value: 'full_body', label: 'Full Body' },
];

const equipmentOptions: { value: EquipmentType; label: string }[] = [
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'resistance_bands', label: 'Resistance Bands' },
  { value: 'pull_up_bar', label: 'Pull-up Bar' },
  { value: 'bench', label: 'Bench' },
];

const difficultyOptions: { value: DifficultyLevel; label: string; color: string }[] = [
  { value: 'beginner', label: 'Beginner', color: 'text-green-600' },
  { value: 'intermediate', label: 'Intermediate', color: 'text-yellow-600' },
  { value: 'advanced', label: 'Advanced', color: 'text-red-600' },
];

interface ExerciseCardProps {
  exercise: Exercise;
  viewMode: 'grid' | 'list';
  onExerciseClick: (exercise: Exercise) => void;
}

function ExerciseCard({ exercise, viewMode, onExerciseClick }: ExerciseCardProps) {
  const difficultyColor =
    difficultyOptions.find((d) => d.value === exercise.difficulty)?.color || 'text-gray-600';

  if (viewMode === 'list') {
    return (
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 border border-gray-200 dark:border-gray-700 cursor-pointer"
        onClick={() => onExerciseClick(exercise)}
      >
        <div className="flex gap-4">
          <ExerciseImage
            exercise={exercise}
            className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden"
            priority={false}
          />
          <div className="flex-grow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {exercise.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
                  {exercise.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium bg-white/90 ${difficultyColor}`}
              >
                {exercise.difficulty}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {exercise.primary_muscles.join(', ')}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {exercise.equipment.join(', ')}
              </span>
              {exercise.recommended_reps && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {exercise.recommended_reps}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // grid view
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700 group cursor-pointer"
      onClick={() => onExerciseClick(exercise)}
    >
      <div className="relative h-48 overflow-hidden">
        <ExerciseImage
          exercise={exercise}
          className="w-full h-full group-hover:scale-105 transition-transform duration-200"
          priority={false}
        />
        <div className="absolute top-2 left-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium bg-white/90 ${difficultyColor}`}
          >
            {exercise.difficulty}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
          {exercise.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
          {exercise.description}
        </p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-1 text-sm">
            <Target className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {exercise.primary_muscles.join(', ')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Dumbbell className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {exercise.equipment.join(', ')}
            </span>
          </div>
          {exercise.recommended_reps && (
            <div className="flex items-center gap-1 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">{exercise.recommended_reps}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
