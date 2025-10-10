import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Save,
  Eye,
  Calendar,
  Dumbbell,
  X,
  Check,
  AlertCircle,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { BottomSheet, useHaptic } from '../../components/ui/BottomSheet';

interface CustomWorkout {
  id: string;
  name: string;
  description?: string;
  estimated_duration?: number;
  difficulty?: string;
  total_exercises?: number;
}

interface AssignedWorkout {
  workout_id: string;
  workout_name: string;
  day_of_week: number;
  week_number: number;
  notes?: string;
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_NAMES_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const ProgramBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const haptic = useHaptic();

  // Program details
  const [programName, setProgramName] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [goal, setGoal] = useState('strength');
  const [isPublic, setIsPublic] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');

  // Workouts
  const [myWorkouts, setMyWorkouts] = useState<CustomWorkout[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [assignedWorkouts, setAssignedWorkouts] = useState<AssignedWorkout[]>([]);

  // UI state
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showWorkoutPicker, setShowWorkoutPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadMyWorkouts();
    }
  }, [user]);

  const loadMyWorkouts = async () => {
    if (!user) return;

    setLoadingWorkouts(true);
    try {
      const { data, error } = await (supabase as any)
        .from('custom_workouts')
        .select('id, name, description, estimated_duration, difficulty, total_exercises')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMyWorkouts(data || []);
    } catch (error) {
      console.error('Error loading workouts:', error);
      toast.error('Failed to load your workouts');
    } finally {
      setLoadingWorkouts(false);
    }
  };

  const handleAssignWorkout = (workout: CustomWorkout) => {
    if (selectedDay === null) return;

    const newAssignment: AssignedWorkout = {
      workout_id: workout.id,
      workout_name: workout.name,
      day_of_week: selectedDay,
      week_number: selectedWeek,
    };

    // Remove existing assignment for this day/week if any
    setAssignedWorkouts((prev) =>
      [...prev.filter((a) => !(a.day_of_week === selectedDay && a.week_number === selectedWeek)), newAssignment]
    );

    setShowWorkoutPicker(false);
    setSelectedDay(null);
    haptic.medium();
    toast.success(`${workout.name} assigned to ${DAY_NAMES[selectedDay]}`);
  };

  const handleRemoveWorkout = (dayIndex: number, week: number) => {
    setAssignedWorkouts((prev) =>
      prev.filter((a) => !(a.day_of_week === dayIndex && a.week_number === week))
    );
    haptic.light();
  };

  const handleCopyWeek = (fromWeek: number) => {
    const weekWorkouts = assignedWorkouts.filter((a) => a.week_number === fromWeek);

    if (weekWorkouts.length === 0) {
      toast.error(`Week ${fromWeek} has no workouts to copy`);
      return;
    }

    // Copy to all other weeks
    const newAssignments: AssignedWorkout[] = [];
    for (let week = 1; week <= durationWeeks; week++) {
      if (week !== fromWeek) {
        weekWorkouts.forEach((workout) => {
          newAssignments.push({
            ...workout,
            week_number: week,
          });
        });
      }
    }

    // Remove existing assignments for those weeks/days
    setAssignedWorkouts((prev) => {
      const filtered = prev.filter((a) => a.week_number === fromWeek);
      return [...filtered, ...newAssignments];
    });

    haptic.medium();
    toast.success(`Week ${fromWeek} copied to all other weeks!`);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    haptic.light();

    try {
      // Create unique filename with user ID as folder (matches RLS policy)
      const fileExt = file.name.split('.').pop();
      const fileName = `program-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('workout-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from('workout-images').getPublicUrl(filePath);

      setHeroImageUrl(urlData.publicUrl);
      haptic.medium();
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
      haptic.error();
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setHeroImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    haptic.light();
    toast.success('Image removed');
  };

  const handleSaveProgram = async () => {
    if (!user) {
      toast.error('Please sign in to save programs');
      return;
    }

    if (!programName.trim()) {
      toast.error('Please enter a program name');
      return;
    }

    if (assignedWorkouts.length === 0) {
      toast.error('Please assign at least one workout to the program');
      return;
    }

    setSaving(true);
    haptic.medium();

    try {
      // Calculate workouts per week (average)
      const workoutsPerWeekMap: { [key: number]: number } = {};
      assignedWorkouts.forEach((a) => {
        workoutsPerWeekMap[a.week_number] = (workoutsPerWeekMap[a.week_number] || 0) + 1;
      });
      const avgWorkoutsPerWeek = Math.round(
        Object.values(workoutsPerWeekMap).reduce((sum, count) => sum + count, 0) / durationWeeks
      );

      // Create program
      const { data: program, error: programError } = await (supabase as any)
        .from('workout_programs')
        .insert({
          user_id: user.id,
          name: programName,
          description: programDescription || null,
          duration_weeks: durationWeeks,
          difficulty,
          goal,
          workouts_per_week: avgWorkoutsPerWeek,
          hero_image_url: heroImageUrl || null,
          is_public: isPublic,
          is_featured: false,
          is_active: true,
          like_count: 0,
          use_count: 0,
        })
        .select()
        .single();

      if (programError) throw programError;

      // Insert program workouts
      const programWorkoutsData = assignedWorkouts.map((a, index) => ({
        program_id: program.id,
        workout_id: a.workout_id,
        day_of_week: a.day_of_week,
        week_number: a.week_number,
        order_index: index,
        notes: a.notes || null,
      }));

      const { error: workoutsError } = await (supabase as any)
        .from('program_workouts')
        .insert(programWorkoutsData);

      if (workoutsError) throw workoutsError;

      toast.success('Program created successfully!');
      navigate(`/modules/workout/workout-library/${program.id}`);
    } catch (error) {
      console.error('Error saving program:', error);
      toast.error('Failed to save program');
      haptic.error();
    } finally {
      setSaving(false);
    }
  };

  const getWorkoutForDay = (week: number, dayIndex: number): AssignedWorkout | undefined => {
    return assignedWorkouts.find((a) => a.week_number === week && a.day_of_week === dayIndex);
  };

  const weekWorkoutCount = assignedWorkouts.filter((a) => a.week_number === selectedWeek).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate('/modules/workout/workout-library')}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 active:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-black text-white">Program Builder</h1>
              <p className="text-xs text-white/60">Create your training program</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Program Details Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-white font-medium mb-2">Program Name *</label>
            <input
              type="text"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="e.g., 8-Week Muscle Builder"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Description</label>
            <textarea
              value={programDescription}
              onChange={(e) => setProgramDescription(e.target.value)}
              placeholder="Describe your program..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none resize-none"
            />
          </div>

          {/* Hero Image Upload */}
          <div>
            <label className="block text-white font-medium mb-2">Program Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {heroImageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-white/20">
                <img
                  src={heroImageUrl}
                  alt="Program hero"
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-2 bg-red-500 rounded-full text-white shadow-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full py-8 bg-white/5 border-2 border-dashed border-white/20 rounded-xl hover:bg-white/10 hover:border-cyan-400/50 transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50"
              >
                {uploadingImage ? (
                  <>
                    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/60 text-sm">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-white/40" />
                    <div className="text-center">
                      <p className="text-white font-medium">Upload Program Image</p>
                      <p className="text-white/60 text-xs mt-1">JPG, PNG or GIF (Max 5MB)</p>
                    </div>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white font-medium mb-2">Duration</label>
              <select
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-cyan-400 focus:outline-none [&>option]:bg-gray-900 [&>option]:text-white"
              >
                {[4, 6, 8, 10, 12, 16].map((weeks) => (
                  <option key={weeks} value={weeks}>
                    {weeks} weeks
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-cyan-400 focus:outline-none [&>option]:bg-gray-900 [&>option]:text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-cyan-400 focus:outline-none [&>option]:bg-gray-900 [&>option]:text-white"
            >
              <option value="strength">Strength</option>
              <option value="hypertrophy">Muscle Gain (Hypertrophy)</option>
              <option value="fat-loss">Fat Loss</option>
              <option value="athletic">Athletic Performance</option>
              <option value="endurance">Endurance</option>
            </select>
          </div>

          <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">
            <div>
              <p className="text-white font-medium">Make Public</p>
              <p className="text-xs text-white/60">Share with the community</p>
            </div>
            <button
              onClick={() => {
                setIsPublic(!isPublic);
                haptic.light();
              }}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPublic ? 'bg-cyan-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  isPublic ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Week Selector */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">Program Schedule</h2>
            {weekWorkoutCount > 0 && (
              <button
                onClick={() => {
                  handleCopyWeek(selectedWeek);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 rounded-lg text-purple-400 text-sm font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Week
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {Array.from({ length: durationWeeks }, (_, i) => i + 1).map((week) => {
              const weekCount = assignedWorkouts.filter((a) => a.week_number === week).length;
              return (
                <button
                  key={week}
                  onClick={() => {
                    setSelectedWeek(week);
                    haptic.light();
                  }}
                  className={`relative px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    selectedWeek === week
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  Week {week}
                  {weekCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                      {weekCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Grid */}
        <div className="space-y-3 mb-6">
          {DAY_NAMES.map((dayName, dayIndex) => {
            const assignedWorkout = getWorkoutForDay(selectedWeek, dayIndex);

            return (
              <motion.div
                key={dayIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.05 }}
                className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span className="text-white font-semibold">{dayName}</span>
                    </div>

                    {assignedWorkout && (
                      <button
                        onClick={() => {
                          handleRemoveWorkout(dayIndex, selectedWeek);
                        }}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {assignedWorkout ? (
                    <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/30">
                      <p className="text-white font-medium">{assignedWorkout.workout_name}</p>
                      <button
                        onClick={() => {
                          setSelectedDay(dayIndex);
                          setShowWorkoutPicker(true);
                          haptic.light();
                        }}
                        className="text-xs text-cyan-400 mt-1"
                      >
                        Change workout
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedDay(dayIndex);
                        setShowWorkoutPicker(true);
                        haptic.light();
                      }}
                      className="w-full py-2 bg-white/5 border border-dashed border-white/20 rounded-lg text-white/60 text-sm font-medium hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Assign Workout
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Info Box */}
        {myWorkouts.length === 0 && !loadingWorkouts && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-400 font-semibold mb-1">No Workouts Found</p>
                <p className="text-orange-400/80 text-sm mb-3">
                  You need to create workouts first before building a program.
                </p>
                <button
                  onClick={() => navigate('/modules/workout/workout-creator')}
                  className="px-4 py-2 bg-orange-500 rounded-lg text-white text-sm font-semibold"
                >
                  Create Workout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSaveProgram}
            disabled={saving || !programName || assignedWorkouts.length === 0}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Program
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/modules/workout/workout-library')}
            disabled={saving}
            className="w-full py-3 bg-white/5 rounded-xl text-white/60 font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Workout Picker Modal */}
      <BottomSheet
        isOpen={showWorkoutPicker}
        onClose={() => setShowWorkoutPicker(false)}
        title={`Assign Workout - ${selectedDay !== null ? DAY_NAMES[selectedDay] : ''}`}
        height="auto"
      >
        <div className="pb-4">
          {loadingWorkouts ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/60 text-sm">Loading workouts...</p>
            </div>
          ) : myWorkouts.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60 text-sm mb-4">No workouts created yet</p>
              <button
                onClick={() => navigate('/modules/workout/workout-creator')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-semibold"
              >
                Create Workout
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {myWorkouts.map((workout) => (
                <button
                  key={workout.id}
                  onClick={() => handleAssignWorkout(workout)}
                  className="w-full p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-cyan-400/50 transition-all text-left"
                >
                  <p className="text-white font-semibold mb-1">{workout.name}</p>
                  {workout.description && (
                    <p className="text-white/60 text-sm line-clamp-1 mb-2">{workout.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    {workout.estimated_duration && (
                      <span>⏱️ {workout.estimated_duration}m</span>
                    )}
                    {workout.total_exercises && (
                      <span>💪 {workout.total_exercises} exercises</span>
                    )}
                    {workout.difficulty && (
                      <span className="capitalize">{workout.difficulty}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
};

export default ProgramBuilderPage;