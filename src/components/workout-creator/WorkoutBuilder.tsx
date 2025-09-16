/**
 * WorkoutBuilder Component
 * Drag-and-drop interface for constructing workouts with set/rep configuration
 */

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Grip, Target, Clock, Dumbbell, Settings, Copy, Trash2 } from 'lucide-react';
import { Exercise } from '../../types/exercise.types';
import { WorkoutExerciseFormData } from '../../types/workout-creator.types';

interface WorkoutBuilderProps {
  exercises: WorkoutExerciseFormData[];
  onExercisesChange: (exercises: WorkoutExerciseFormData[]) => void;
  exerciseLibrary: Exercise[]; // For looking up exercise details
}

interface ExerciseWithDetails extends WorkoutExerciseFormData {
  exercise?: Exercise;
  tempId: string; // For React keys during reordering
}

export function WorkoutBuilder({
  exercises,
  onExercisesChange,
  exerciseLibrary,
}: WorkoutBuilderProps) {
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [supersetGroupCounter, setSupersetGroupCounter] = useState(1);

  // Convert exercises to internal format with details and temp IDs
  const exercisesWithDetails: ExerciseWithDetails[] = exercises.map((ex, index) => ({
    ...ex,
    exercise: exerciseLibrary.find((lib) => lib.id === ex.exercise_id),
    tempId: `${ex.exercise_id}-${index}`,
  }));

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedExercises = Array.from(exercisesWithDetails);
    const [movedExercise] = reorderedExercises.splice(result.source.index, 1);
    reorderedExercises.splice(result.destination.index, 0, movedExercise);

    // Convert back to the expected format without tempId and exercise details
    const updatedExercises = reorderedExercises.map(({ tempId, exercise, ...ex }) => ex);
    onExercisesChange(updatedExercises);
  };

  const updateExercise = (index: number, updates: Partial<WorkoutExerciseFormData>) => {
    const updatedExercises = [...exercises];
    updatedExercises[index] = { ...updatedExercises[index], ...updates };
    onExercisesChange(updatedExercises);
  };

  const removeExercise = (index: number) => {
    const updatedExercises = exercises.filter((_, i) => i !== index);
    onExercisesChange(updatedExercises);
  };

  const duplicateExercise = (index: number) => {
    const exerciseToDuplicate = { ...exercises[index] };
    const updatedExercises = [
      ...exercises.slice(0, index + 1),
      exerciseToDuplicate,
      ...exercises.slice(index + 1),
    ];
    onExercisesChange(updatedExercises);
  };

  const createSuperset = (startIndex: number, endIndex: number) => {
    if (startIndex >= endIndex) return;

    const updatedExercises = [...exercises];
    const groupId = supersetGroupCounter;

    for (let i = startIndex; i <= endIndex; i++) {
      updatedExercises[i].superset_group = groupId;
    }

    setSupersetGroupCounter((prev) => prev + 1);
    onExercisesChange(updatedExercises);
  };

  const removeFromSuperset = (index: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[index].superset_group = undefined;
    onExercisesChange(updatedExercises);
  };

  const calculateWorkoutSummary = () => {
    const totalExercises = exercises.length;
    const estimatedDuration =
      exercises.reduce((total, ex) => {
        const workTime = ex.sets * 45; // ~45 seconds per set
        const restTime = ex.sets * ex.rest_seconds;
        return total + (workTime + restTime);
      }, 0) / 60; // convert to minutes

    const muscleGroups = new Set<string>();
    exercises.forEach((ex) => {
      const exercise = exerciseLibrary.find((lib) => lib.id === ex.exercise_id);
      exercise?.primary_muscles.forEach((muscle: string) => muscleGroups.add(muscle));
    });

    return {
      totalExercises,
      estimatedDuration: Math.round(estimatedDuration),
      muscleGroups: Array.from(muscleGroups),
      totalSets: exercises.reduce((total, ex) => total + ex.sets, 0),
    };
  };

  const summary = calculateWorkoutSummary();

  if (exercises.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
        <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No exercises added yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Add exercises from the library to start building your workout
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Tip: You can drag and drop exercises to reorder them
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workout Summary */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Workout Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.totalExercises}</div>
            <div className="text-sm opacity-90">Exercises</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.totalSets}</div>
            <div className="text-sm opacity-90">Total Sets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.estimatedDuration}m</div>
            <div className="text-sm opacity-90">Est. Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.muscleGroups.length}</div>
            <div className="text-sm opacity-90">Muscle Groups</div>
          </div>
        </div>
        {summary.muscleGroups.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="text-sm opacity-90 mb-2">Target Muscles:</div>
            <div className="flex flex-wrap gap-2">
              {summary.muscleGroups.slice(0, 6).map((muscle) => (
                <span key={muscle} className="px-2 py-1 bg-white/20 rounded-full text-xs">
                  {muscle}
                </span>
              ))}
              {summary.muscleGroups.length > 6 && (
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                  +{summary.muscleGroups.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Exercise List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="exercises">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {exercisesWithDetails.map((exerciseData, index) => (
                <Draggable
                  key={exerciseData.tempId}
                  draggableId={exerciseData.tempId}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-white dark:bg-gray-800 rounded-xl border transition-all duration-200 ${
                        snapshot.isDragging
                          ? 'shadow-lg border-orange-500 transform rotate-1'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      } ${exerciseData.superset_group ? 'border-l-4 border-l-purple-500' : ''}`}
                    >
                      <ExerciseItem
                        exerciseData={exerciseData}
                        index={index}
                        isEditing={editingExercise === exerciseData.tempId}
                        onEdit={() => setEditingExercise(exerciseData.tempId)}
                        onStopEdit={() => setEditingExercise(null)}
                        onUpdate={(updates) => updateExercise(index, updates)}
                        onRemove={() => removeExercise(index)}
                        onDuplicate={() => duplicateExercise(index)}
                        onCreateSuperset={() => createSuperset(index, index + 1)}
                        onRemoveFromSuperset={() => removeFromSuperset(index)}
                        dragHandleProps={provided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

interface ExerciseItemProps {
  exerciseData: ExerciseWithDetails;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onStopEdit: () => void;
  onUpdate: (updates: Partial<WorkoutExerciseFormData>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onCreateSuperset: () => void;
  onRemoveFromSuperset: () => void;
  dragHandleProps: any;
}

function ExerciseItem({
  exerciseData,
  index,
  isEditing,
  onEdit,
  onStopEdit,
  onUpdate,
  onRemove,
  onDuplicate,
  onCreateSuperset,
  onRemoveFromSuperset,
  dragHandleProps,
}: ExerciseItemProps) {
  const { exercise } = exerciseData;

  if (!exercise) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Exercise not found (ID: {exerciseData.exercise_id})
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Drag Handle */}
        <div {...dragHandleProps} className="mt-1 cursor-grab active:cursor-grabbing">
          <Grip className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
        </div>

        {/* Exercise Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {index + 1}. {exercise.name}
              </h3>
              {exerciseData.superset_group && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 mt-1">
                  Superset Group {exerciseData.superset_group}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Edit exercise"
              >
                <Settings className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={onDuplicate}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Duplicate exercise"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={onRemove}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-500 hover:text-red-600"
                title="Remove exercise"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>{exercise.primary_muscles.join(', ')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Dumbbell className="w-4 h-4" />
              <span>{exercise.equipment.join(', ')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{exerciseData.rest_seconds}s rest</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration */}
      {isEditing ? (
        <ExerciseConfigForm
          exerciseData={exerciseData}
          onUpdate={onUpdate}
          onClose={onStopEdit}
          onCreateSuperset={onCreateSuperset}
          onRemoveFromSuperset={onRemoveFromSuperset}
        />
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {exerciseData.sets}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sets</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {exerciseData.reps}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Reps</div>
            </div>
            {exerciseData.weight_suggestion && (
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {exerciseData.weight_suggestion} lbs
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Weight</div>
              </div>
            )}
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {exerciseData.rest_seconds}s
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rest</div>
            </div>
          </div>

          {exerciseData.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Notes:</strong> {exerciseData.notes}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ExerciseConfigFormProps {
  exerciseData: ExerciseWithDetails;
  onUpdate: (updates: Partial<WorkoutExerciseFormData>) => void;
  onClose: () => void;
  onCreateSuperset: () => void;
  onRemoveFromSuperset: () => void;
}

function ExerciseConfigForm({
  exerciseData,
  onUpdate,
  onClose,
  onCreateSuperset,
  onRemoveFromSuperset,
}: ExerciseConfigFormProps) {
  const [formData, setFormData] = useState({
    sets: exerciseData.sets,
    reps: exerciseData.reps,
    weight_suggestion: exerciseData.weight_suggestion || '',
    rest_seconds: exerciseData.rest_seconds,
    notes: exerciseData.notes,
    is_warmup: exerciseData.is_warmup,
    is_cooldown: exerciseData.is_cooldown,
  });

  const handleSave = () => {
    onUpdate({
      sets: formData.sets,
      reps: formData.reps,
      weight_suggestion: formData.weight_suggestion
        ? Number(formData.weight_suggestion)
        : undefined,
      rest_seconds: formData.rest_seconds,
      notes: formData.notes,
      is_warmup: formData.is_warmup,
      is_cooldown: formData.is_cooldown,
    });
    onClose();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sets
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={formData.sets}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, sets: parseInt(e.target.value) || 1 }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Reps */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reps
          </label>
          <input
            type="text"
            placeholder="8-12, AMRAP, 30s"
            value={formData.reps}
            onChange={(e) => setFormData((prev) => ({ ...prev, reps: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Weight (lbs)
          </label>
          <input
            type="number"
            min="0"
            step="2.5"
            placeholder="Optional"
            value={formData.weight_suggestion}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, weight_suggestion: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Rest */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rest (seconds)
          </label>
          <select
            value={formData.rest_seconds}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, rest_seconds: parseInt(e.target.value) }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value={30}>30s</option>
            <option value={45}>45s</option>
            <option value={60}>1m</option>
            <option value={90}>1.5m</option>
            <option value={120}>2m</option>
            <option value={180}>3m</option>
            <option value={240}>4m</option>
            <option value={300}>5m</option>
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          placeholder="Add exercise-specific notes..."
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Exercise Type Toggles */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_warmup}
            onChange={(e) => setFormData((prev) => ({ ...prev, is_warmup: e.target.checked }))}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Warm-up exercise</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_cooldown}
            onChange={(e) => setFormData((prev) => ({ ...prev, is_cooldown: e.target.checked }))}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Cool-down exercise</span>
        </label>
      </div>

      {/* Superset Controls */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-600">
        {exerciseData.superset_group ? (
          <button
            onClick={onRemoveFromSuperset}
            className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            Remove from Superset
          </button>
        ) : (
          <button
            onClick={onCreateSuperset}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            Create Superset
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
