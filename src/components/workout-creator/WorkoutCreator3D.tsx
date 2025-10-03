import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  Target,
  Save,
  Copy,
  Trash2,
  Grip,
  ChevronDown,
  ChevronUp,
  Edit3,
  Zap,
} from 'lucide-react';

/** ===== Types ===== */
export interface ExerciseLite {
  id?: string;
  name?: string;
  primary_muscles?: string[];
}

export interface WorkoutExerciseFormData {
  exercise_id?: string;
  exercise?: ExerciseLite | null;
  sets: number;
  reps: string;
  weight_suggestion?: string;
  rest_seconds: number;
  notes?: string;
  is_warmup?: boolean;
  is_cooldown?: boolean;
  superset_group?: string | number;
}

type ExerciseUpdate = Partial<WorkoutExerciseFormData>;

/** ===== Glass3DCard ===== */
interface Glass3DCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  selected?: boolean;
}

const Glass3DCard: React.FC<Glass3DCardProps> = ({
  children,
  className = '',
  glowColor = '#00E5FF',
  onClick,
  selected = false,
}) => {
  const overflowVisible = className.includes('overflow-visible');
  return (
    <motion.div
      role={onClick ? 'button' : undefined}
      aria-pressed={selected || undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
      className={`
        relative group ${onClick ? 'cursor-pointer' : 'cursor-default'}
        bg-gradient-to-br from-white/10 to-white/5
        backdrop-blur-xl border border-white/20
        rounded-2xl ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'}
        transform-gpu perspective-1000
        ${className}
      `}
      style={{
        boxShadow: selected
          ? `0 0 30px ${glowColor}40, inset 0 0 30px ${glowColor}20`
          : '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
      }}
      whileHover={
        onClick
          ? {
              scale: 1.02,
              rotateY: 2,
              rotateX: 1,
              boxShadow: `0 25px 50px rgba(0,0,0,0.4), 0 0 40px ${glowColor}60`,
            }
          : undefined
      }
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
      {children}

      {/* Selection indicator */}
      {selected && (
        <motion.div
          className="absolute inset-0 border-2 rounded-2xl pointer-events-none"
          style={{ borderColor: glowColor }}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
        />
      )}
    </motion.div>
  );
};

/** ===== HolographicButton ===== */
interface HolographicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const HolographicButton: React.FC<HolographicButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
}) => {
  const variants = {
    primary: 'from-cyan-500 via-blue-500 to-purple-600',
    secondary: 'from-gray-400 via-gray-500 to-gray-600',
    danger: 'from-red-500 via-orange-500 to-yellow-500',
    success: 'from-green-400 via-emerald-500 to-teal-600',
  } as const;

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  } as const;

  return (
    <motion.button
      type={type}
      className={`
        relative overflow-hidden rounded-xl font-semibold text-white
        bg-gradient-to-r ${variants[variant]}
        shadow-lg hover:shadow-xl transition-all duration-300
        ${sizes[size]} ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      disabled={disabled}
      onClick={onClick}
      whileHover={
        !disabled
          ? {
              scale: 1.05,
              boxShadow: '0 0 25px rgba(0,229,255,0.6)',
            }
          : undefined
      }
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>

      {/* Animated shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0"
        animate={{
          x: ['-100%', '200%'],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'easeInOut',
        }}
      />
    </motion.button>
  );
};

/** ===== FloatingElement ===== */
const FloatingElement: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
        rotate: [0, 1, 0, -1, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  );
};

/** ===== Exercise Editor ===== */
interface ExerciseEditorProps {
  exercise: WorkoutExerciseFormData;
  onUpdate: (updates: ExerciseUpdate) => void;
}

const ExerciseEditor: React.FC<ExerciseEditorProps> = ({ exercise, onUpdate }) => {
  // Keep inputs as strings to avoid React number-input warnings.
  const [sets, setSets] = useState<string>(String(exercise.sets ?? 0));
  const [reps, setReps] = useState<string>(exercise.reps ?? '');
  const [weight, setWeight] = useState<string>(exercise.weight_suggestion ?? '');
  const [rest, setRest] = useState<string>(String(exercise.rest_seconds ?? 0));
  const [notes, setNotes] = useState<string>(exercise.notes ?? '');

  const parseOr = (v: string, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const handleSave = () => {
    onUpdate({
      sets: parseOr(sets, exercise.sets ?? 0),
      reps,
      weight_suggestion: weight.trim() ? weight.trim() : undefined,
      rest_seconds: parseOr(rest, exercise.rest_seconds ?? 0),
      notes: notes.trim(),
    });
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="space-y-4 p-4 bg-black/20 rounded-lg backdrop-blur-sm border border-white/10"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 text-sm mb-1">Sets</label>
          <input
            type="number"
            inputMode="numeric"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm mb-1">Reps</label>
          <input
            type="text"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="8-12"
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm mb-1">Weight</label>
          <input
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm mb-1">Rest (seconds)</label>
          <input
            type="number"
            inputMode="numeric"
            value={rest}
            onChange={(e) => setRest(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-white/80 text-sm mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes or modifications..."
          rows={3}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none resize-none"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <HolographicButton onClick={handleSave} size="sm" type="button">
          <Save className="w-4 h-4" />
          Save Changes
        </HolographicButton>
      </div>
    </motion.div>
  );
};

/** ===== Exercise Card 3D ===== */
interface ExerciseCardProps {
  exercise: WorkoutExerciseFormData;
  index: number;
  isEditing?: boolean;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onUpdate?: (updates: ExerciseUpdate) => void;
}

const ExerciseCard3D: React.FC<ExerciseCardProps> = ({
  exercise,
  isEditing = false,
  onEdit,
  onDuplicate,
  onDelete,
  onUpdate,
  index,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const headerTextColor = exercise.exercise?.name ? 'white' : '#ff6b6b';
  const glowColor = !exercise.exercise
    ? '#ff6b6b'
    : exercise.superset_group
      ? '#B400FF'
      : '#00E5FF';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      onDelete?.();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, y: -50, rotateX: 15 }}
      transition={{ delay: index * 0.1 }}
    >
      <Glass3DCard className="p-6 mb-4 group" glowColor={glowColor} selected={isEditing}>
        <div className="relative">
          {/* Drag Handle */}
          <div className="absolute -left-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
              <Grip className="w-4 h-4 text-white/60" />
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  className="text-lg sm:text-xl font-bold mb-1 truncate"
                  style={{ color: headerTextColor }}
                >
                  {exercise.exercise?.name ||
                    `❌ Unknown Exercise (ID: ${exercise.exercise_id?.slice(0, 8) || 'missing'})`}
                </h3>
                <div className="flex items-center gap-2 text-white/60">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">
                    {exercise.exercise?.primary_muscles?.join(', ') || 'Unknown muscles'}
                  </span>
                </div>
                {!exercise.exercise && (
                  <div className="mt-1 px-2 py-1 bg-red-500/20 border border-red-400/30 rounded text-red-300 text-xs">
                    Exercise not found in library. Please remove and re-add.
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Edit Exercise"
                aria-label="Edit Exercise"
              >
                <Edit3 className="w-4 h-4 text-white" />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: -10 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate?.();
                }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Duplicate Exercise"
                aria-label="Duplicate Exercise"
              >
                <Copy className="w-4 h-4 text-white" />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDelete}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                title="Delete Exercise"
                aria-label="Delete Exercise"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9, rotate: 180 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded((v) => !v);
                }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title={isExpanded ? 'Collapse' : 'Expand'}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-white" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-cyan-400">{exercise.sets}</div>
              <div className="text-xs text-white/60 uppercase tracking-wider">Sets</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-400 truncate">
                {exercise.reps}
              </div>
              <div className="text-xs text-white/60 uppercase tracking-wider">Reps</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-orange-400 truncate">
                {exercise.weight_suggestion || '-'}
              </div>
              <div className="text-xs text-white/60 uppercase tracking-wider">Weight</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-400">
                {exercise.rest_seconds}s
              </div>
              <div className="text-xs text-white/60 uppercase tracking-wider">Rest</div>
            </div>
          </div>

          {/* Superset Indicator */}
          {exercise.superset_group && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mb-4 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30"
            >
              <div className="flex items-center gap-2 text-purple-300">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Superset Group {exercise.superset_group}
                </span>
              </div>
            </motion.div>
          )}

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-white/20">
                  {isEditing ? (
                    <ExerciseEditor exercise={exercise} onUpdate={(u) => onUpdate?.(u)} />
                  ) : (
                    <div className="space-y-3">
                      {exercise.notes && (
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="text-sm text-white/80">{exercise.notes}</div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {exercise.is_warmup && (
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-400/30">
                            Warm-up
                          </span>
                        )}
                        {exercise.is_cooldown && (
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-400/30">
                            Cool-down
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Glass3DCard>
    </motion.div>
  );
};

export { Glass3DCard, HolographicButton, FloatingElement, ExerciseCard3D };
