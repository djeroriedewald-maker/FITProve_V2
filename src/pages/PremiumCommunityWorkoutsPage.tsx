import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  TrendingUp,
  Star,
  Heart,
  Eye,
  MessageCircle,
  Users,
  Dumbbell,
  Clock,
  Zap,
  Target,
  ChevronRight,
  Bookmark,
  Share2,
  Copy,
  Play,
  ArrowLeft,
} from 'lucide-react';

import { BottomSheet, useHaptic } from '../components/ui/BottomSheet';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Types
interface CommunityWorkout {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  hero_image_url?: string;
  total_exercises: number;
  like_count: number;
  use_count: number;
  share_count: number;
  estimated_duration?: number;
  estimated_calories?: number;
  primary_muscle_groups?: string[];
  tags?: string[];
  trainingType?: string;
  created_at: string;
  creator: {
    id: string;
    display_name: string;
    username: string;
    avatar_url?: string;
  };
  exercises?: Array<{
    name: string;
    sets: number;
    reps: string;
  }>;
}

interface FilterState {
  difficulty: string[];
  duration: string[];
  muscleGroups: string[];
  sortBy: 'popular' | 'recent' | 'most_liked' | 'most_used';
}

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner', color: 'green' },
  { value: 'intermediate', label: 'Intermediate', color: 'yellow' },
  { value: 'advanced', label: 'Advanced', color: 'red' },
];

const DURATION_OPTIONS = [
  { value: '0-30', label: '< 30 min' },
  { value: '30-45', label: '30-45 min' },
  { value: '45-60', label: '45-60 min' },
  { value: '60+', label: '> 60 min' },
];

const MUSCLE_GROUP_OPTIONS = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body'
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'most_liked', label: 'Most Liked' },
  { value: 'most_used', label: 'Most Used' },
];

export const PremiumCommunityWorkoutsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const haptic = useHaptic();

  // State
  const [workouts, setWorkouts] = useState<CommunityWorkout[]>([]);
  const [trendingWorkouts, setTrendingWorkouts] = useState<CommunityWorkout[]>([]);
  const [featuredWorkouts, setFeaturedWorkouts] = useState<CommunityWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showWorkoutDetail, setShowWorkoutDetail] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<CommunityWorkout | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    difficulty: [],
    duration: [],
    muscleGroups: [],
    sortBy: 'popular',
  });

  // Stats
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    activeUsers: 0,
    totalLikes: 0,
  });

  // Fetch workouts
  useEffect(() => {
    fetchWorkouts();
  }, [filters, searchQuery]);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      // Base query
      let query = supabase
        .from('custom_workouts')
        .select(`
          *,
          profiles!custom_workouts_user_id_fkey(id, display_name, username, avatar_url)
        `)
        .eq('is_public', true);

      // Apply filters
      if (filters.difficulty.length > 0) {
        query = query.in('difficulty', filters.difficulty);
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'popular':
          query = query.order('use_count', { ascending: false });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'most_liked':
          query = query.order('like_count', { ascending: false });
          break;
        case 'most_used':
          query = query.order('use_count', { ascending: false });
          break;
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      // Map data to our type
      const mappedWorkouts: CommunityWorkout[] = (data || []).map((w: any) => ({
        id: w.id,
        name: w.name,
        description: w.description,
        difficulty: w.difficulty,
        hero_image_url: w.hero_image_url,
        total_exercises: w.total_exercises || 0,
        like_count: w.like_count || 0,
        use_count: w.use_count || 0,
        share_count: w.share_count || 0,
        estimated_duration: w.estimated_duration,
        estimated_calories: w.estimated_calories,
        primary_muscle_groups: w.primary_muscle_groups || [],
        tags: w.tags || [],
        trainingType: w.trainingType,
        created_at: w.created_at,
        creator: {
          id: w.profiles?.id || '',
          display_name: w.profiles?.display_name || 'Unknown',
          username: w.profiles?.username || 'unknown',
          avatar_url: w.profiles?.avatar_url,
        },
      }));

      setWorkouts(mappedWorkouts);

      // Fetch trending (top 5 most used this week)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: trendingData } = await supabase
        .from('custom_workouts')
        .select(`
          *,
          profiles!custom_workouts_user_id_fkey(id, display_name, username, avatar_url)
        `)
        .eq('is_public', true)
        .gte('created_at', oneWeekAgo.toISOString())
        .order('use_count', { ascending: false })
        .limit(5);

      if (trendingData) {
        setTrendingWorkouts(
          trendingData.map((w: any) => ({
            id: w.id,
            name: w.name,
            description: w.description,
            difficulty: w.difficulty,
            hero_image_url: w.hero_image_url,
            total_exercises: w.total_exercises || 0,
            like_count: w.like_count || 0,
            use_count: w.use_count || 0,
            share_count: w.share_count || 0,
            estimated_duration: w.estimated_duration,
            estimated_calories: w.estimated_calories,
            primary_muscle_groups: w.primary_muscle_groups || [],
            tags: w.tags || [],
            created_at: w.created_at,
            creator: {
              id: w.profiles?.id || '',
              display_name: w.profiles?.display_name || 'Unknown',
              username: w.profiles?.username || 'unknown',
              avatar_url: w.profiles?.avatar_url,
            },
          }))
        );
      }

      // Fetch featured (manually curated - for now, just most liked)
      const { data: featuredData } = await supabase
        .from('custom_workouts')
        .select(`
          *,
          profiles!custom_workouts_user_id_fkey(id, display_name, username, avatar_url)
        `)
        .eq('is_public', true)
        .order('like_count', { ascending: false })
        .limit(6);

      if (featuredData) {
        setFeaturedWorkouts(
          featuredData.map((w: any) => ({
            id: w.id,
            name: w.name,
            description: w.description,
            difficulty: w.difficulty,
            hero_image_url: w.hero_image_url,
            total_exercises: w.total_exercises || 0,
            like_count: w.like_count || 0,
            use_count: w.use_count || 0,
            share_count: w.share_count || 0,
            estimated_duration: w.estimated_duration,
            estimated_calories: w.estimated_calories,
            primary_muscle_groups: w.primary_muscle_groups || [],
            tags: w.tags || [],
            created_at: w.created_at,
            creator: {
              id: w.profiles?.id || '',
              display_name: w.profiles?.display_name || 'Unknown',
              username: w.profiles?.username || 'unknown',
              avatar_url: w.profiles?.avatar_url,
            },
          }))
        );
      }

      // Fetch stats
      const { count: workoutCount } = await supabase
        .from('custom_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true);

      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { data: likesData } = await supabase
        .from('custom_workouts')
        .select('like_count')
        .eq('is_public', true);

      const totalLikes = likesData?.reduce((sum, w) => sum + (w.like_count || 0), 0) || 0;

      setStats({
        totalWorkouts: workoutCount || 0,
        activeUsers: userCount || 0,
        totalLikes,
      });
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle workout detail view
  const handleViewDetails = async (workout: CommunityWorkout) => {
    haptic.light();

    // Fetch full workout details with exercises
    try {
      const { data: exercisesData } = await supabase
        .from('custom_workout_exercises')
        .select(`
          *,
          exercises(name)
        `)
        .eq('custom_workout_id', workout.id)
        .order('order_index', { ascending: true });

      const exercises = (exercisesData || []).map((ex: any) => ({
        name: ex.exercises?.name || 'Unknown',
        sets: ex.sets,
        reps: ex.reps,
      }));

      setSelectedWorkout({ ...workout, exercises });
      setShowWorkoutDetail(true);
    } catch (error) {
      console.error('Error fetching workout details:', error);
    }
  };

  // Handle use workout
  const handleUseWorkout = (workoutId: string) => {
    haptic.medium();
    navigate(`/modules/workout/community?start=${workoutId}&type=creator`);
  };

  // Handle copy & edit
  const handleCopyAndEdit = (workout: CommunityWorkout) => {
    haptic.medium();
    // Navigate to creator with workout data
    navigate('/modules/workout/workout-creator', {
      state: {
        copyFrom: workout,
        attribution: `Based on @${workout.creator.username}'s workout`,
      },
    });
  };

  // Handle like
  const handleLike = async (workoutId: string) => {
    if (!user) return;

    haptic.success();

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('workout_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('custom_workout_id', workoutId)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('workout_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('custom_workout_id', workoutId);
      } else {
        // Like
        await supabase
          .from('workout_likes')
          .insert({
            user_id: user.id,
            custom_workout_id: workoutId,
          });
      }

      // Refresh workouts
      fetchWorkouts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Active filter count
  const activeFilterCount =
    filters.difficulty.length +
    filters.duration.length +
    filters.muscleGroups.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <h1 className="text-lg font-bold text-white">Community Workouts</h1>

          <button
            onClick={() => {
              haptic.light();
              setShowFilters(true);
            }}
            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/10"
          >
            <Filter className="w-5 h-5 text-white" />
            {activeFilterCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{activeFilterCount}</span>
              </div>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workouts..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 pt-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 backdrop-blur-xl rounded-xl p-4 border border-cyan-500/20"
          >
            <Dumbbell className="w-6 h-6 text-cyan-400 mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalWorkouts}</div>
            <div className="text-xs text-white/60">Workouts</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 backdrop-blur-xl rounded-xl p-4 border border-purple-500/20"
          >
            <Users className="w-6 h-6 text-purple-400 mb-2" />
            <div className="text-2xl font-bold text-white">{stats.activeUsers}</div>
            <div className="text-xs text-white/60">Creators</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 backdrop-blur-xl rounded-xl p-4 border border-orange-500/20"
          >
            <Heart className="w-6 h-6 text-orange-400 mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalLikes}</div>
            <div className="text-xs text-white/60">Likes</div>
          </motion.div>
        </div>
      </div>

      {/* Trending Section */}
      {trendingWorkouts.length > 0 && (
        <div className="px-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Trending This Week</h2>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {trendingWorkouts.map((workout, index) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-72 snap-start"
                onClick={() => handleViewDetails(workout)}
              >
                <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 cursor-pointer group">
                  {workout.hero_image_url ? (
                    <img
                      src={workout.hero_image_url}
                      alt={workout.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <Dumbbell className="w-16 h-16 text-white/40" />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="px-2 py-1 bg-orange-500 rounded-full text-xs font-bold text-white">
                        #{index + 1} Trending
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        workout.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                        workout.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {workout.difficulty}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                      {workout.name}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
                      <span>by @{workout.creator.username}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{workout.like_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{workout.use_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{workout.estimated_duration || 45}m</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Section */}
      {featuredWorkouts.length > 0 && (
        <div className="px-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Featured by FitProve</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {featuredWorkouts.slice(0, 4).map((workout, index) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleViewDetails(workout)}
                className="relative h-40 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 cursor-pointer"
              >
                {workout.hero_image_url ? (
                  <img
                    src={workout.hero_image_url}
                    alt={workout.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Dumbbell className="w-12 h-12 text-white/40" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="absolute top-2 right-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-sm font-bold text-white mb-1 line-clamp-2">
                    {workout.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Heart className="w-3 h-3" />
                    <span>{workout.like_count}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Workouts Section */}
      <div className="px-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">All Workouts</h2>
          <span className="text-sm text-white/60">{workouts.length} workouts</span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading workouts...</p>
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No workouts found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout, index) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                index={index}
                onViewDetails={() => handleViewDetails(workout)}
                onUse={() => handleUseWorkout(workout.id)}
                onLike={() => handleLike(workout.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      <BottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Workouts"
        height="auto"
      >
        <div className="space-y-6 pb-4">
          {/* Difficulty */}
          <div>
            <label className="block text-white font-medium mb-3">Difficulty</label>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_OPTIONS.map((diff) => (
                <button
                  key={diff.value}
                  onClick={() => {
                    haptic.light();
                    setFilters((prev) => ({
                      ...prev,
                      difficulty: prev.difficulty.includes(diff.value)
                        ? prev.difficulty.filter((d) => d !== diff.value)
                        : [...prev.difficulty, diff.value],
                    }));
                  }}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    filters.difficulty.includes(diff.value)
                      ? `bg-${diff.color}-500 text-white`
                      : 'bg-white/5 text-white/60'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-white font-medium mb-3">Sort By</label>
            <div className="space-y-2">
              {SORT_OPTIONS.map((sort) => (
                <button
                  key={sort.value}
                  onClick={() => {
                    haptic.light();
                    setFilters((prev) => ({ ...prev, sortBy: sort.value as any }));
                  }}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-left transition-all ${
                    filters.sortBy === sort.value
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-white/5 text-white/60'
                  }`}
                >
                  {sort.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                haptic.light();
                setFilters({
                  difficulty: [],
                  duration: [],
                  muscleGroups: [],
                  sortBy: 'popular',
                });
              }}
              className="flex-1 py-3 bg-white/10 rounded-xl text-white font-semibold"
            >
              Clear All
            </button>
            <button
              onClick={() => {
                haptic.medium();
                setShowFilters(false);
              }}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-semibold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Workout Detail Bottom Sheet */}
      <BottomSheet
        isOpen={showWorkoutDetail}
        onClose={() => setShowWorkoutDetail(false)}
        title={selectedWorkout?.name || 'Workout Details'}
        height="full"
      >
        {selectedWorkout && (
          <WorkoutDetailSheet
            workout={selectedWorkout}
            onUse={() => handleUseWorkout(selectedWorkout.id)}
            onCopyEdit={() => handleCopyAndEdit(selectedWorkout)}
            onLike={() => handleLike(selectedWorkout.id)}
          />
        )}
      </BottomSheet>
    </div>
  );
};

// Workout Card Component
const WorkoutCard: React.FC<{
  workout: CommunityWorkout;
  index: number;
  onViewDetails: () => void;
  onUse: () => void;
  onLike: () => void;
}> = ({ workout, index, onViewDetails, onUse, onLike }) => {
  const haptic = useHaptic();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
    >
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div
          className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
          onClick={onViewDetails}
        >
          {workout.hero_image_url ? (
            <img
              src={workout.hero_image_url}
              alt={workout.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-white/60" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3
                className="font-bold text-white mb-1 line-clamp-1 cursor-pointer"
                onClick={onViewDetails}
              >
                {workout.name}
              </h3>
              <p className="text-sm text-white/60 mb-2">by @{workout.creator.username}</p>
            </div>
            <div className={`px-2 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ml-2 ${
              workout.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
              workout.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {workout.difficulty}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-white/60 mb-3">
            <div className="flex items-center gap-1">
              <Dumbbell className="w-3 h-3" />
              <span>{workout.total_exercises}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{workout.estimated_duration || 45}m</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{workout.like_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{workout.use_count}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                haptic.medium();
                onUse();
              }}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg text-white text-xs font-semibold"
            >
              Use
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                haptic.light();
                onLike();
              }}
              className="px-3 py-2 bg-white/10 rounded-lg"
            >
              <Heart className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                haptic.light();
                onViewDetails();
              }}
              className="px-3 py-2 bg-white/10 rounded-lg"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Workout Detail Sheet Component
const WorkoutDetailSheet: React.FC<{
  workout: CommunityWorkout;
  onUse: () => void;
  onCopyEdit: () => void;
  onLike: () => void;
}> = ({ workout, onUse, onCopyEdit, onLike }) => {
  const haptic = useHaptic();

  return (
    <div className="space-y-6 pb-4">
      {/* Hero Image */}
      {workout.hero_image_url && (
        <div className="relative -mx-6 -mt-4 h-48 mb-4">
          <img
            src={workout.hero_image_url}
            alt={workout.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        </div>
      )}

      {/* Creator Info */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {workout.creator.display_name.charAt(0)}
          </span>
        </div>
        <div>
          <div className="font-semibold text-white">{workout.creator.display_name}</div>
          <div className="text-sm text-white/60">@{workout.creator.username}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-cyan-400">{workout.total_exercises}</div>
          <div className="text-xs text-white/60">Exercises</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-purple-400">{workout.estimated_duration || 45}m</div>
          <div className="text-xs text-white/60">Duration</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-orange-400">~{workout.estimated_calories || 300}</div>
          <div className="text-xs text-white/60">Calories</div>
        </div>
      </div>

      {/* Description */}
      {workout.description && (
        <div>
          <h3 className="text-white font-semibold mb-2">Description</h3>
          <p className="text-white/70">{workout.description}</p>
        </div>
      )}

      {/* Exercises */}
      {workout.exercises && workout.exercises.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-cyan-400" />
            Exercises ({workout.exercises.length})
          </h3>
          <div className="space-y-2">
            {workout.exercises.map((exercise, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-xl p-3 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{exercise.name}</div>
                  <div className="text-sm text-white/60">
                    {exercise.sets} × {exercise.reps}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Stats */}
      <div className="flex items-center gap-4 text-sm text-white/60">
        <div className="flex items-center gap-1">
          <Heart className="w-4 h-4" />
          <span>{workout.like_count} likes</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{workout.use_count} uses</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <button
          onClick={() => {
            haptic.medium();
            onUse();
          }}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl text-white font-bold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
        >
          <Play className="w-6 h-6" />
          Use This Workout
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              haptic.medium();
              onCopyEdit();
            }}
            className="py-3 bg-white/10 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
          >
            <Copy className="w-5 h-5" />
            Copy & Edit
          </button>
          <button
            onClick={() => {
              haptic.success();
              onLike();
            }}
            className="py-3 bg-white/10 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
          >
            <Heart className="w-5 h-5" />
            Like
          </button>
        </div>
      </div>
    </div>
  );
};