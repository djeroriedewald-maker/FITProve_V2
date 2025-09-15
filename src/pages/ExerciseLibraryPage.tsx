import React, { useState, useMemo } from 'react';
import { Search, Filter, Grid, List, Play, Clock, Target, Dumbbell } from 'lucide-react';
import { Exercise, MuscleGroup, EquipmentType, DifficultyLevel, ExerciseCategory } from '../types/exercise.types';
import { exerciseLibrary } from '../data/exerciseLibrary';

// Filter options for the UI
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
  { value: 'full_body', label: 'Full Body' }
];

const equipmentOptions: { value: EquipmentType; label: string }[] = [
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'resistance_bands', label: 'Resistance Bands' },
  { value: 'pull_up_bar', label: 'Pull-up Bar' },
  { value: 'bench', label: 'Bench' }
];

const difficultyOptions: { value: DifficultyLevel; label: string; color: string }[] = [
  { value: 'beginner', label: 'Beginner', color: 'text-green-600' },
  { value: 'intermediate', label: 'Intermediate', color: 'text-yellow-600' },
  { value: 'advanced', label: 'Advanced', color: 'text-red-600' }
];

interface ExerciseCardProps {
  exercise: Exercise;
  viewMode: 'grid' | 'list';
  onVideoClick: (exercise: Exercise) => void;
  onAddToWorkout: (exercise: Exercise) => void;
}

function ExerciseCard({ exercise, viewMode, onVideoClick, onAddToWorkout }: ExerciseCardProps) {
  const difficultyColor = difficultyOptions.find(d => d.value === exercise.difficulty)?.color || 'text-gray-600';

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          {/* Exercise Image */}
          <div className="flex-shrink-0 w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            {exercise.image_url ? (
              <img 
                src={exercise.image_url} 
                alt={exercise.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Dumbbell className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Exercise Info */}
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
              
              {/* Actions */}
              <div className="flex gap-2 ml-4">
                {exercise.youtube_id && (
                  <button
                    onClick={() => onVideoClick(exercise)}
                    className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/30 rounded-lg transition-colors"
                    title="Watch video"
                  >
                    <Play className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                )}
                <button
                  onClick={() => onAddToWorkout(exercise)}
                  className="px-3 py-2 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-800/30 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-medium transition-colors"
                >
                  Add to Workout
                </button>
              </div>
            </div>

            {/* Exercise Details */}
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  {exercise.primary_muscles.join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Dumbbell className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  {exercise.equipment.join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`font-medium ${difficultyColor}`}>
                  {exercise.difficulty}
                </span>
              </div>
              {exercise.recommended_reps && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {exercise.recommended_reps}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700 group">
      {/* Exercise Image */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {exercise.image_url ? (
          <img 
            src={exercise.image_url} 
            alt={exercise.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dumbbell className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Video Play Button */}
        {exercise.youtube_id && (
          <button
            onClick={() => onVideoClick(exercise)}
            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            title="Watch video"
          >
            <Play className="w-4 h-4 text-white" />
          </button>
        )}

        {/* Difficulty Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/90 ${difficultyColor}`}>
            {exercise.difficulty}
          </span>
        </div>
      </div>

      {/* Exercise Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
          {exercise.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
          {exercise.description}
        </p>

        {/* Exercise Details */}
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
              <span className="text-gray-600 dark:text-gray-400">
                {exercise.recommended_reps}
              </span>
            </div>
          )}
        </div>

        {/* Add to Workout Button */}
        <button
          onClick={() => onAddToWorkout(exercise)}
          className="w-full px-4 py-2 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-800/30 text-orange-600 dark:text-orange-400 rounded-lg font-medium transition-colors"
        >
          Add to Workout
        </button>
      </div>
    </div>
  );
}

export function ExerciseLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<MuscleGroup[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<DifficultyLevel[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter exercises based on current filters
  const filteredExercises = useMemo(() => {
    return exerciseLibrary.filter(exercise => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          exercise.name.toLowerCase().includes(query) ||
          exercise.description.toLowerCase().includes(query) ||
          exercise.tags.some(tag => tag.toLowerCase().includes(query)) ||
          exercise.primary_muscles.some(muscle => muscle.toLowerCase().includes(query)) ||
          exercise.equipment.some(eq => eq.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // Muscle group filter
      if (selectedMuscleGroups.length > 0) {
        const hasMatchingMuscle = selectedMuscleGroups.some(muscle =>
          exercise.primary_muscles.includes(muscle) || exercise.secondary_muscles.includes(muscle)
        );
        if (!hasMatchingMuscle) return false;
      }

      // Equipment filter
      if (selectedEquipment.length > 0) {
        const hasMatchingEquipment = selectedEquipment.some(equipment =>
          exercise.equipment.includes(equipment)
        );
        if (!hasMatchingEquipment) return false;
      }

      // Difficulty filter
      if (selectedDifficulties.length > 0) {
        if (!selectedDifficulties.includes(exercise.difficulty)) return false;
      }

      return true;
    });
  }, [searchQuery, selectedMuscleGroups, selectedEquipment, selectedDifficulties]);

  const handleVideoClick = (exercise: Exercise) => {
    if (exercise.youtube_id) {
      window.open(`https://www.youtube.com/watch?v=${exercise.youtube_id}`, '_blank');
    }
  };

  const handleAddToWorkout = (exercise: Exercise) => {
    // TODO: Implement workout creator integration
    console.log('Adding to workout:', exercise.name);
    // This will be connected to the workout creator later
  };

  const toggleMuscleGroup = (muscle: MuscleGroup) => {
    setSelectedMuscleGroups(prev =>
      prev.includes(muscle)
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  const toggleEquipment = (equipment: EquipmentType) => {
    setSelectedEquipment(prev =>
      prev.includes(equipment)
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
  };

  const toggleDifficulty = (difficulty: DifficultyLevel) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedMuscleGroups([]);
    setSelectedEquipment([]);
    setSelectedDifficulties([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Exercise Library
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Discover {exerciseLibrary.length}+ exercises with detailed instructions and video demonstrations
          </p>

          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  showFilters
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
              <button
                onClick={clearAllFilters}
                className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-6">
              {/* Muscle Groups */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Muscle Groups</h4>
                <div className="flex flex-wrap gap-2">
                  {muscleGroupOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => toggleMuscleGroup(option.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedMuscleGroups.includes(option.value)
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Equipment</h4>
                <div className="flex flex-wrap gap-2">
                  {equipmentOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => toggleEquipment(option.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedEquipment.includes(option.value)
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Difficulty</h4>
                <div className="flex flex-wrap gap-2">
                  {difficultyOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => toggleDifficulty(option.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedDifficulties.includes(option.value)
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Showing {filteredExercises.length} of {exerciseLibrary.length} exercises
          </p>
        </div>

        {/* Exercise Grid/List */}
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredExercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              viewMode={viewMode}
              onVideoClick={handleVideoClick}
              onAddToWorkout={handleAddToWorkout}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <Dumbbell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No exercises found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}