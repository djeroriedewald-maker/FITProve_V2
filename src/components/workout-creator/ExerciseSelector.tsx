/**
 * ExerciseSelector Component
 * Allows users to browse and select exercises from the library for workout creation
 */

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, X, ChevronDown, Dumbbell, Clock, Target } from 'lucide-react';
import { Exercise } from '../../types/exercise.types';
import { ExerciseService } from '../../lib/exercise.service';

interface ExerciseSelectorProps {
  onExerciseSelect: (exercise: Exercise) => void;
  selectedExercises?: string[]; // Array of exercise IDs already selected
  isOpen: boolean;
  onClose: () => void;
}

interface ExerciseFilters {
  searchQuery: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: string[];
  category: string[];
}

const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'abs',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'forearms',
  'cardio',
];

const EQUIPMENT_OPTIONS = [
  'bodyweight',
  'dumbbells',
  'barbell',
  'cable_machine',
  'resistance_bands',
  'kettlebell',
  'medicine_ball',
  'pull_up_bar',
  'bench',
  'exercise_ball',
];

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

const CATEGORIES = ['strength', 'cardio', 'flexibility', 'power', 'endurance'];

export function ExerciseSelector({
  onExerciseSelect,
  selectedExercises = [],
  isOpen,
  onClose,
}: ExerciseSelectorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ExerciseFilters>({
    searchQuery: '',
    muscleGroups: [],
    equipment: [],
    difficulty: [],
    category: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  // Load exercises on component mount
  useEffect(() => {
    if (isOpen) {
      loadExercises();
    }
  }, [isOpen]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const exerciseData = await ExerciseService.getExercises();
      setExercises(exerciseData.exercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...exercises];

    // Search query filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(query) ||
          exercise.description.toLowerCase().includes(query) ||
          exercise.primary_muscles.some((muscle) => muscle.toLowerCase().includes(query)) ||
          exercise.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Muscle groups filter
    if (filters.muscleGroups.length > 0) {
      filtered = filtered.filter(
        (exercise) =>
          exercise.primary_muscles.some((muscle) => filters.muscleGroups.includes(muscle)) ||
          exercise.secondary_muscles.some((muscle) => filters.muscleGroups.includes(muscle))
      );
    }

    // Equipment filter
    if (filters.equipment.length > 0) {
      filtered = filtered.filter((exercise) =>
        exercise.equipment.some((eq) => filters.equipment.includes(eq))
      );
    }

    // Difficulty filter
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter((exercise) => filters.difficulty.includes(exercise.difficulty));
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(
        (exercise) => exercise.category && filters.category.includes(exercise.category)
      );
    }

    setFilteredExercises(filtered);
  }, [exercises, filters]);

  // Apply filters when applyFilters changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (filterType: keyof ExerciseFilters, value: string | string[]) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));

    // Scroll to top when searching to show results from the beginning
    if (filterType === 'searchQuery') {
      setTimeout(() => {
        const exerciseList = document.querySelector('[data-exercise-list]');
        if (exerciseList) {
          exerciseList.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const toggleFilter = (
    filterType: 'muscleGroups' | 'equipment' | 'difficulty' | 'category',
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((item) => item !== value)
        : [...prev[filterType], value],
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      muscleGroups: [],
      equipment: [],
      difficulty: [],
      category: [],
    });
  };

  const isExerciseSelected = (exerciseId: string) => selectedExercises.includes(exerciseId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Exercises</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>

            {(filters.muscleGroups.length > 0 ||
              filters.equipment.length > 0 ||
              filters.difficulty.length > 0 ||
              filters.category.length > 0) && (
              <button
                onClick={clearFilters}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 space-y-4">
              {/* Muscle Groups */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Muscle Groups</h4>
                <div className="flex flex-wrap gap-2">
                  {MUSCLE_GROUPS.map((muscle) => (
                    <button
                      key={muscle}
                      onClick={() => toggleFilter('muscleGroups', muscle)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filters.muscleGroups.includes(muscle)
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {muscle}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Equipment</h4>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_OPTIONS.map((equipment) => (
                    <button
                      key={equipment}
                      onClick={() => toggleFilter('equipment', equipment)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filters.equipment.includes(equipment)
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {equipment.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Difficulty</h4>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTY_LEVELS.map((difficulty) => (
                      <button
                        key={difficulty}
                        onClick={() => toggleFilter('difficulty', difficulty)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          filters.difficulty.includes(difficulty)
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {difficulty}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleFilter('category', category)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          filters.category.includes(category)
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Exercise Results */}
        <div className="flex-1 overflow-y-auto p-6" data-exercise-list>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} found
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    isSelected={isExerciseSelected(exercise.id)}
                    onSelect={() => onExerciseSelect(exercise)}
                  />
                ))}
              </div>

              {filteredExercises.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No exercises found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
  isSelected: boolean;
  onSelect: () => void;
}

function ExerciseCard({ exercise, isSelected, onSelect }: ExerciseCardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-700 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
      }`}
    >
      {/* Exercise Image */}
      <div className="relative">
        {exercise.image_url ? (
          <img
            src={exercise.image_url}
            alt={exercise.name}
            className="w-full h-32 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-32 bg-gray-200 dark:bg-gray-600 rounded-t-lg flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <Plus className="w-4 h-4 text-white rotate-45" />
          </div>
        )}
      </div>

      {/* Exercise Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {exercise.name}
        </h3>

        <div className="space-y-2 text-sm">
          {/* Primary Muscles */}
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {exercise.primary_muscles.slice(0, 2).join(', ')}
              {exercise.primary_muscles.length > 2 && ` +${exercise.primary_muscles.length - 2}`}
            </span>
          </div>

          {/* Equipment */}
          <div className="flex items-center gap-1">
            <Dumbbell className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {exercise.equipment.slice(0, 2).join(', ')}
              {exercise.equipment.length > 2 && ` +${exercise.equipment.length - 2}`}
            </span>
          </div>

          {/* Recommended Reps */}
          {exercise.recommended_reps && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">{exercise.recommended_reps}</span>
            </div>
          )}
        </div>

        {/* Difficulty Badge */}
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              exercise.difficulty === 'beginner'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : exercise.difficulty === 'intermediate'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {exercise.difficulty}
          </span>

          <button
            onClick={onSelect}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isSelected
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
            }`}
          >
            {isSelected ? 'Selected' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
