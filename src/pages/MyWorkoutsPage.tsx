import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Dumbbell,
  Clock,
  Zap,
  Users,
  Lock,
  Eye,
  Calendar,
  Trash2,
  Edit3,
  Play,
  MoreVertical,
  Search,
  Filter,
  TrendingUp,
  Target,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CustomWorkout } from '../types/workout-creator.types';
import { BottomSheet, useHaptic } from '../components/ui/BottomSheet';
import { ScheduleWorkoutModal } from '../components/ScheduleWorkoutModal';

interface WorkoutWithDetails extends CustomWorkout {
  exercise_count?: number;
  creator_name?: string;
}

type FilterTab = 'all' | 'public' | 'private';
type SortOption = 'recent' | 'popular' | 'name';

export const MyWorkoutsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const haptic = useHaptic();

  const [workouts, setWorkouts] = useState<WorkoutWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutWithDetails | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [workoutToSchedule, setWorkoutToSchedule] = useState<WorkoutWithDetails | null>(null);

  // Load workouts
  useEffect(() => {
    if (user) {
      loadWorkouts();
    }
  }, [user, filterTab, sortBy]);

  const loadWorkouts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = (supabase as any)
        .from('custom_workouts')
        .select(`
          *,
          custom_workout_exercises(count)
        `)
        .eq('user_id', user.id);

      // Apply filter
      if (filterTab === 'public') {
        query = query.eq('is_public', true);
      } else if (filterTab === 'private') {
        query = query.eq('is_public', false);
      }

      // Apply sort
      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'popular') {
        query = query.order('use_count', { ascending: false });
      } else if (sortBy === 'name') {
        query = query.order('name', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped: WorkoutWithDetails[] = (data || []).map((w: any) => ({
        id: w.id,
        user_id: w.user_id,
        name: w.name,
        description: w.description || '',
        difficulty: w.difficulty,
        estimated_duration: w.estimated_duration,
        estimated_calories: w.estimated_calories,
        total_exercises: w.total_exercises || 0,
        tags: w.tags || [],
        primary_muscle_groups: w.primary_muscle_groups || [],
        equipment_needed: w.equipment_needed || [],
        hero_image_url: w.hero_image_url,
        is_public: w.is_public || false,
        is_featured: w.is_featured || false,
        like_count: w.like_count || 0,
        use_count: w.use_count || 0,
        share_count: w.share_count || 0,
        created_at: w.created_at,
        updated_at: w.updated_at,
        exercise_count: w.custom_workout_exercises?.[0]?.count || 0,
      }));

      setWorkouts(mapped);
    } catch (error) {
      console.error('Error loading workouts:', error);
      toast.error('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  // Filter workouts by search
  const filteredWorkouts = workouts.filter((workout) =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Delete workout
  const handleDeleteWorkout = async () => {
    if (!selectedWorkout) return;

    setDeleting(true);
    haptic.heavy();

    try {
      const { error } = await (supabase as any)
        .from('custom_workouts')
        .delete()
        .eq('id', selectedWorkout.id)
        .eq('user_id', user?.id); // Extra security check

      if (error) throw error;

      toast.success('Workout deleted successfully');
      setWorkouts((prev) => prev.filter((w) => w.id !== selectedWorkout.id));
      setShowDeleteConfirm(false);
      setSelectedWorkout(null);
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
      haptic.error();
    } finally {
      setDeleting(false);
    }
  };

  // Calculate stats
  const stats = {
    total: workouts.length,
    public: workouts.filter((w) => w.is_public).length,
    private: workouts.filter((w) => !w.is_public).length,
    totalUses: workouts.reduce((sum, w) => sum + w.use_count, 0),
    totalLikes: workouts.reduce((sum, w) => sum + w.like_count, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading your workouts...</p>
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
            <div>
              <h1 className="text-2xl font-black text-white">My Workouts</h1>
              <p className="text-sm text-white/60">{stats.total} workouts created</p>
            </div>

            <button
              onClick={() => navigate('/modules/workout/workout-creator')}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-cyan-400">{stats.total}</div>
              <div className="text-xs text-white/60">Total</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-green-400">{stats.public}</div>
              <div className="text-xs text-white/60">Public</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-purple-400">{stats.totalUses}</div>
              <div className="text-xs text-white/60">Uses</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-orange-400">{stats.totalLikes}</div>
              <div className="text-xs text-white/60">Likes</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workouts..."
              className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none"
            />
            <button
              onClick={() => setShowFilters(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Filter className="w-5 h-5 text-white/40" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All', count: stats.total },
              { value: 'public', label: 'Public', count: stats.public },
              { value: 'private', label: 'Private', count: stats.private },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setFilterTab(tab.value as FilterTab);
                  haptic.light();
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  filterTab === tab.value
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Program Builder Promotion - Show when user has workouts */}
      {workouts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 pt-6"
        >
          <button
            onClick={() => {
              haptic.medium();
              navigate('/modules/workout/create-program');
            }}
            className="w-full p-5 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-2 border-purple-500/50 rounded-2xl hover:border-purple-400 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-bold text-base mb-1">Build Multi-Week Programs</p>
                <p className="text-white/70 text-sm">
                  Combine your {workouts.length} {workouts.length === 1 ? 'workout' : 'workouts'} into complete training programs
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-purple-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </div>
          </button>
        </motion.div>
      )}

      {/* Workout List */}
      <div className="px-4 pt-6">
        {filteredWorkouts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-10 h-10 text-white/40" />
            </div>
            <p className="text-white/60 mb-4">
              {searchQuery
                ? 'No workouts found'
                : workouts.length === 0
                ? 'No workouts created yet'
                : 'No workouts match your filter'}
            </p>
            {workouts.length === 0 && (
              <button
                onClick={() => navigate('/modules/workout/workout-creator')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-semibold"
              >
                Create Your First Workout
              </button>
            )}
            {/* Program Builder Promotion for 3+ workouts */}
            {!searchQuery && workouts.length >= 3 && filterTab !== 'all' && (
              <div className="mt-6 max-w-md mx-auto">
                <div className="p-4 bg-gradient-to-r from-purple-600/10 to-cyan-600/10 border border-purple-500/30 rounded-2xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <p className="text-white font-bold">Ready for the Next Level?</p>
                  </div>
                  <p className="text-white/70 text-sm mb-3">
                    You have {workouts.length} workouts! Build them into a complete training program.
                  </p>
                  <button
                    onClick={() => {
                      haptic.medium();
                      navigate('/modules/workout/create-program');
                    }}
                    className="w-full py-2 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    Build a Program
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {filteredWorkouts.map((workout) => (
                <motion.div
                  key={workout.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10"
                >
                  {/* Hero Image */}
                  {workout.hero_image_url && (
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={workout.hero_image_url}
                        alt={workout.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-1 truncate">
                          {workout.name}
                        </h3>
                        {workout.description && (
                          <p className="text-sm text-white/60 line-clamp-2 mb-2">
                            {workout.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              workout.difficulty === 'beginner'
                                ? 'bg-green-500/20 text-green-400'
                                : workout.difficulty === 'intermediate'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {workout.difficulty}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                              workout.is_public
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {workout.is_public ? (
                              <>
                                <Eye className="w-3 h-3" /> Public
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" /> Private
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Menu */}
                      <button
                        onClick={() => {
                          setSelectedWorkout(workout);
                          haptic.light();
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors ml-3"
                      >
                        <MoreVertical className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-4 h-4" />
                        {workout.exercise_count || workout.total_exercises} exercises
                      </span>
                      {workout.estimated_duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {workout.estimated_duration}m
                        </span>
                      )}
                      {workout.estimated_calories && (
                        <span className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          {workout.estimated_calories} cal
                        </span>
                      )}
                    </div>

                    {/* Social Stats */}
                    {workout.is_public && (workout.use_count > 0 || workout.like_count > 0) && (
                      <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
                        {workout.use_count > 0 && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {workout.use_count} uses
                          </span>
                        )}
                        {workout.like_count > 0 && (
                          <span className="flex items-center gap-1">
                            ❤️ {workout.like_count}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Created Date */}
                    <div className="flex items-center gap-1 text-xs text-white/40">
                      <Calendar className="w-3 h-3" />
                      Created {new Date(workout.created_at).toLocaleDateString()}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/modules/workout/workout-start/${workout.id}`)}
                        className="py-2 bg-gradient-to-r from-green-500 to-cyan-600 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Start
                      </button>
                      <button
                        onClick={() => {
                          navigate(`/modules/workout/workout-creator?edit=${workout.id}`);
                        }}
                        className="py-2 bg-white/10 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Workout Menu Bottom Sheet */}
      <BottomSheet
        isOpen={selectedWorkout !== null}
        onClose={() => setSelectedWorkout(null)}
        title={selectedWorkout?.name || ''}
        height="auto"
      >
        {selectedWorkout && (
          <div className="space-y-3 pb-4">
            <button
              onClick={() => {
                navigate(`/modules/workout/workout-start/${selectedWorkout.id}`);
                setSelectedWorkout(null);
              }}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-cyan-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Workout
            </button>

            <button
              onClick={() => {
                setWorkoutToSchedule(selectedWorkout);
                setShowScheduleModal(true);
                setSelectedWorkout(null);
              }}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Schedule Workout
            </button>

            <button
              onClick={() => {
                navigate(`/modules/workout/workout-creator?edit=${selectedWorkout.id}`);
                setSelectedWorkout(null);
              }}
              className="w-full py-3 bg-white/10 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            >
              <Edit3 className="w-5 h-5" />
              Edit Workout
            </button>

            {selectedWorkout.is_public && (
              <button
                onClick={() => {
                  navigate('/modules/workout/community');
                  setSelectedWorkout(null);
                }}
                className="w-full py-3 bg-white/10 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                View in Community
              </button>
            )}

            <button
              onClick={() => {
                setShowDeleteConfirm(true);
              }}
              className="w-full py-3 bg-red-500/20 rounded-xl text-red-400 font-semibold flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete Workout
            </button>

            <button
              onClick={() => setSelectedWorkout(null)}
              className="w-full py-3 bg-white/5 rounded-xl text-white/60 font-semibold"
            >
              Cancel
            </button>
          </div>
        )}
      </BottomSheet>

      {/* Delete Confirmation */}
      <BottomSheet
        isOpen={showDeleteConfirm}
        onClose={() => !deleting && setShowDeleteConfirm(false)}
        title="Delete Workout?"
        height="auto"
      >
        <div className="pb-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-1">This action cannot be undone</p>
              <p className="text-white/60 text-sm">
                Deleting "{selectedWorkout?.name}" will permanently remove it from your library and
                the community (if public).
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleDeleteWorkout}
              disabled={deleting}
              className="w-full py-3 bg-red-500 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Yes, Delete Workout
                </>
              )}
            </button>

            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
              className="w-full py-3 bg-white/10 rounded-xl text-white font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Filters Bottom Sheet */}
      <BottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Sort & Filter"
        height="auto"
      >
        <div className="space-y-6 pb-4">
          {/* Sort */}
          <div>
            <label className="block text-white font-medium mb-3">Sort By</label>
            <div className="space-y-2">
              {[
                { value: 'recent', label: 'Most Recent', icon: Calendar },
                { value: 'popular', label: 'Most Popular', icon: TrendingUp },
                { value: 'name', label: 'Name (A-Z)', icon: Target },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value as SortOption);
                    haptic.light();
                  }}
                  className={`w-full py-3 rounded-xl font-semibold text-left px-4 flex items-center gap-3 transition-all ${
                    sortBy === option.value
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <option.icon className="w-5 h-5" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setShowFilters(false);
              haptic.medium();
            }}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-semibold"
          >
            Apply
          </button>
        </div>
      </BottomSheet>

      {/* Schedule Workout Modal */}
      <ScheduleWorkoutModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        workout={workoutToSchedule}
        onScheduled={() => {
          setShowScheduleModal(false);
          setWorkoutToSchedule(null);
          toast.success('Check your planner to see the scheduled workout!');
        }}
      />
    </div>
  );
};