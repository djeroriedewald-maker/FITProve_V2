import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, X, Check, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { BottomSheet, useHaptic } from './ui/BottomSheet';
import { WorkoutProgramsService } from '../lib/workout-programs.service';
import { CustomWorkout } from '../types/workout-creator.types';

interface ScheduleWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: CustomWorkout | null;
  onScheduled?: () => void;
}

export const ScheduleWorkoutModal: React.FC<ScheduleWorkoutModalProps> = ({
  isOpen,
  onClose,
  workout,
  onScheduled,
}) => {
  const haptic = useHaptic();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Generate date options (today + next 30 days)
  const dateOptions = Array.from({ length: 31 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split('T')[0],
      label: i === 0
        ? 'Today'
        : i === 1
        ? 'Tomorrow'
        : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      date: date,
    };
  });

  // Time options (every hour from 5 AM to 11 PM)
  const timeOptions = Array.from({ length: 19 }, (_, i) => {
    const hour = i + 5;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return {
      value: `${hour.toString().padStart(2, '0')}:00`,
      label: `${displayHour}:00 ${period}`,
    };
  });

  const handleSchedule = async () => {
    if (!workout || !selectedDate) {
      toast.error('Please select a date');
      return;
    }

    setIsScheduling(true);
    haptic.medium();

    try {
      const success = await WorkoutProgramsService.scheduleWorkout(
        workout.id,
        selectedDate,
        selectedTime || undefined,
        notes || undefined
      );

      if (success) {
        haptic.success();
        toast.success(`${workout.name} scheduled successfully!`);
        onScheduled?.();
        handleClose();
      } else {
        throw new Error('Failed to schedule workout');
      }
    } catch (error) {
      console.error('Error scheduling workout:', error);
      haptic.error();
      toast.error('Failed to schedule workout');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleClose = () => {
    setSelectedDate('');
    setSelectedTime('');
    setNotes('');
    onClose();
  };

  if (!workout) return null;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Schedule Workout"
      height="auto"
    >
      <div className="space-y-6 pb-4">
        {/* Workout Preview */}
        <div className="bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-2xl p-4 border border-cyan-400/30">
          <h3 className="text-lg font-bold text-white mb-1">{workout.name}</h3>
          {workout.description && (
            <p className="text-sm text-white/70 mb-3">{workout.description}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
              workout.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
              workout.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {workout.difficulty}
            </span>
            {workout.estimated_duration && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-semibold">
                {workout.estimated_duration} min
              </span>
            )}
            {workout.total_exercises && (
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-semibold">
                {workout.total_exercises} exercises
              </span>
            )}
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-white font-medium mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            Select Date *
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {dateOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedDate(option.value);
                  haptic.light();
                }}
                className={`py-3 px-4 rounded-xl font-semibold text-sm text-left transition-all ${
                  selectedDate === option.value
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                    : 'bg-white/5 text-white/80 hover:bg-white/10'
                }`}
              >
                <div className="font-bold">{option.label}</div>
                <div className="text-xs opacity-70">{option.dayName}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection (Optional) */}
        <div>
          <label className="block text-white font-medium mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Select Time (Optional)
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            <button
              onClick={() => {
                setSelectedTime('');
                haptic.light();
              }}
              className={`py-2 rounded-xl font-semibold text-sm transition-all ${
                selectedTime === ''
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Any time
            </button>
            {timeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedTime(option.value);
                  haptic.light();
                }}
                className={`py-2 rounded-xl font-semibold text-sm transition-all ${
                  selectedTime === option.value
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-white font-medium mb-2">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes for this workout..."
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none resize-none"
            maxLength={500}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleClose}
            disabled={isScheduling}
            className="flex-1 py-3 bg-white/10 rounded-xl text-white font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={isScheduling || !selectedDate}
            className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isScheduling ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Scheduling...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Schedule Workout
              </>
            )}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};