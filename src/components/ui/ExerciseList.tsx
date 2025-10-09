import { useState } from 'react';
import { FaCheckCircle, FaRegCircle, FaDumbbell } from 'react-icons/fa';
import type { PlannerScheduleExercise } from '../../lib/planner-payload';

interface ExerciseListProps {
  exercises: PlannerScheduleExercise[];
  onToggleExercise?: (index: number, completed: boolean) => void;
  readonly?: boolean;
}

const SECTION_LABELS: Record<string, string> = {
  warmup: '🔥 Warm-up',
  main: '💪 Main Workout',
  cooldown: '❄️ Cool-down',
};

const SECTION_COLORS: Record<string, string> = {
  warmup: 'from-orange-500/20 to-yellow-500/20 border-orange-500',
  main: 'from-cyan-500/20 to-purple-500/20 border-cyan-500',
  cooldown: 'from-blue-500/20 to-teal-500/20 border-blue-500',
};

export function ExerciseList({ exercises, onToggleExercise, readonly = false }: ExerciseListProps) {
  const [localExercises, setLocalExercises] = useState(exercises);

  const handleToggle = (index: number) => {
    if (readonly) return;

    const newCompleted = !localExercises[index].completed;
    const updatedExercises = [...localExercises];
    updatedExercises[index] = { ...updatedExercises[index], completed: newCompleted };
    setLocalExercises(updatedExercises);

    if (onToggleExercise) {
      onToggleExercise(index, newCompleted);
    }
  };

  // Group exercises by section
  const sections = localExercises.reduce((acc, exercise) => {
    if (!acc[exercise.section]) {
      acc[exercise.section] = [];
    }
    acc[exercise.section].push(exercise);
    return acc;
  }, {} as Record<string, PlannerScheduleExercise[]>);

  const sectionOrder = ['warmup', 'main', 'cooldown'];
  const orderedSections = sectionOrder.filter(section => sections[section]);

  // Calculate completion progress
  const completedCount = localExercises.filter(ex => ex.completed).length;
  const totalCount = localExercises.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      {!readonly && totalCount > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-cyan-300">
            <span>Progress</span>
            <span>{completedCount}/{totalCount} exercises</span>
          </div>
          <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-cyan-700">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Exercise sections */}
      {orderedSections.map((sectionKey) => {
        const sectionExercises = sections[sectionKey];
        const startIndex = localExercises.findIndex(ex => ex.section === sectionKey);

        return (
          <div key={sectionKey} className="space-y-2">
            <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              {SECTION_LABELS[sectionKey] || sectionKey}
              <span className="text-xs text-gray-400">({sectionExercises.length})</span>
            </h4>
            <div className="space-y-2">
              {sectionExercises.map((exercise, idx) => {
                const globalIndex = startIndex + idx;
                const isCompleted = exercise.completed;

                return (
                  <div
                    key={globalIndex}
                    className={`
                      relative p-3 rounded-lg border bg-gradient-to-br backdrop-blur-sm
                      ${SECTION_COLORS[sectionKey]}
                      ${!readonly ? 'cursor-pointer hover:scale-[1.02]' : ''}
                      ${isCompleted ? 'opacity-60' : ''}
                      transition-all duration-200
                    `}
                    onClick={() => handleToggle(globalIndex)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      {!readonly && (
                        <div className="text-xl mt-0.5">
                          {isCompleted ? (
                            <FaCheckCircle className="text-green-400" />
                          ) : (
                            <FaRegCircle className="text-gray-400" />
                          )}
                        </div>
                      )}

                      {/* Exercise details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FaDumbbell className="text-cyan-400 text-sm" />
                          <span className={`font-semibold text-white ${isCompleted ? 'line-through' : ''}`}>
                            {exercise.name}
                          </span>
                        </div>

                        {/* Sets/Reps/Time */}
                        <div className="flex flex-wrap gap-3 text-xs text-cyan-100/80">
                          {exercise.sets && (
                            <span>📊 {exercise.sets} sets</span>
                          )}
                          {exercise.reps && (
                            <span>🔢 {exercise.reps}</span>
                          )}
                          {exercise.time && (
                            <span>⏱️ {exercise.time}</span>
                          )}
                          {exercise.distance && (
                            <span>📏 {exercise.distance}</span>
                          )}
                          {exercise.rest && (
                            <span>💤 {exercise.rest}s rest</span>
                          )}
                        </div>

                        {/* Equipment & Muscles */}
                        {(exercise.equipment.length > 0 || exercise.primaryMuscles.length > 0) && (
                          <div className="mt-2 space-y-1">
                            {exercise.equipment.length > 0 && (
                              <div className="text-xs text-purple-300">
                                🏋️ {exercise.equipment.join(', ')}
                              </div>
                            )}
                            {exercise.primaryMuscles.length > 0 && (
                              <div className="text-xs text-orange-300">
                                💪 {exercise.primaryMuscles.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
