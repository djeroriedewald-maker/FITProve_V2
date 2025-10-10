import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Dumbbell,
  TrendingUp,
  Star,
  Users,
  Search,
  Filter,
  Plus,
  Target,
  Flame,
  Heart,
  Trophy,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { BottomSheet, useHaptic } from '../../components/ui/BottomSheet';

// Types
interface WorkoutProgram {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  duration_weeks: number;
  is_active: boolean;
  is_public?: boolean;
  is_featured?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  goal?: string;
  workouts_per_week?: number;
  hero_image_url?: string;
  like_count?: number;
  use_count?: number;
  created_at: string;
  creator?: {
    display_name: string;
    username: string;
  };
}

type TabType = 'browse' | 'featured' | 'community' | 'mine';
type GoalFilter = 'all' | 'strength' | 'hypertrophy' | 'fat-loss' | 'athletic' | 'endurance';

const GOAL_OPTIONS = [
  { value: 'all', label: 'All Goals', icon: Target, color: 'cyan' },
  { value: 'strength', label: 'Strength', icon: Dumbbell, color: 'red' },
  { value: 'hypertrophy', label: 'Muscle Gain', icon: Flame, color: 'orange' },
  { value: 'fat-loss', label: 'Fat Loss', icon: TrendingUp, color: 'green' },
  { value: 'athletic', label: 'Athletic', icon: Trophy, color: 'yellow' },
  { value: 'endurance', label: 'Endurance', icon: Activity, color: 'blue' },
];

const WorkoutLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const haptic = useHaptic();

  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<GoalFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);

  // Load programs based on active tab
  useEffect(() => {
    loadPrograms();
  }, [activeTab, user]);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      let query = (supabase as any).from('workout_programs').select(`
        *,
        profiles!workout_programs_user_id_fkey (
          display_name,
          username
        )
      `);

      // Apply tab filters
      if (activeTab === 'featured') {
        query = query.eq('is_featured', true).eq('is_public', true);
      } else if (activeTab === 'community') {
        query = query.eq('is_public', true).neq('user_id', user?.id || '');
      } else if (activeTab === 'mine') {
        if (!user) {
          setPrograms([]);
          setLoading(false);
          return;
        }
        query = query.eq('user_id', user.id);
      } else {
        // Browse: all public programs
        query = query.eq('is_public', true);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const mapped: WorkoutProgram[] = (data || []).map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        name: p.name,
        description: p.description,
        duration_weeks: p.duration_weeks,
        is_active: p.is_active,
        is_public: p.is_public,
        is_featured: p.is_featured,
        difficulty: p.difficulty,
        goal: p.goal,
        workouts_per_week: p.workouts_per_week,
        hero_image_url: p.hero_image_url,
        like_count: p.like_count || 0,
        use_count: p.use_count || 0,
        created_at: p.created_at,
        creator: p.profiles ? {
          display_name: p.profiles.display_name,
          username: p.profiles.username,
        } : undefined,
      }));

      setPrograms(mapped);
    } catch (error) {
      console.error('Error loading programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  // Filter programs by search and goal
  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGoal = selectedGoal === 'all' || program.goal === selectedGoal;
    return matchesSearch && matchesGoal;
  });

  // Calculate stats
  const stats = {
    total: programs.length,
    featured: programs.filter(p => p.is_featured).length,
    avgWeeks: programs.length > 0
      ? Math.round(programs.reduce((sum, p) => sum + p.duration_weeks, 0) / programs.length)
      : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 safe-top">
          {/* Back button + Title */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate('/modules/workout')}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 active:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-white truncate">Training Programs</h1>
              <p className="text-xs sm:text-sm text-white/60 truncate">Multi-week workout plans</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-cyan-400">{stats.total}</div>
              <div className="text-xs text-white/60">Programs</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-orange-400">{stats.featured}</div>
              <div className="text-xs text-white/60">Featured</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-purple-400">{stats.avgWeeks}</div>
              <div className="text-xs text-white/60">Avg Weeks</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search programs..."
              className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none"
            />
            <button
              onClick={() => setShowFilters(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Filter className="w-5 h-5 text-white/40" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 snap-x">
            {[
              { value: 'browse', label: 'Browse', mobileLabel: 'Browse', icon: Target },
              { value: 'featured', label: 'Featured', mobileLabel: 'Featured', icon: Star },
              { value: 'community', label: 'Community', mobileLabel: 'Community', icon: Users },
              { value: 'mine', label: 'My Programs', mobileLabel: 'Mine', icon: Heart },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value as TabType);
                  haptic.light();
                }}
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 snap-start ${
                  activeTab === tab.value
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/5 text-white/60 active:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.mobileLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Create Program Button */}
      {activeTab === 'mine' && user && (
        <div className="px-4 pt-4">
          <button
            onClick={() => navigate('/modules/workout/create-program')}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Program
          </button>
        </div>
      )}

      {/* Programs List */}
      <div className="px-4 pt-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading programs...</p>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-white/40" />
            </div>
            <p className="text-white/60 mb-2">
              {searchQuery
                ? 'No programs found'
                : activeTab === 'mine' && !user
                ? 'Sign in to create programs'
                : activeTab === 'mine'
                ? 'No programs created yet'
                : 'No programs available'}
            </p>
            {activeTab === 'mine' && user && (
              <button
                onClick={() => navigate('/modules/workout/create-program')}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-semibold"
              >
                Create Your First Program
              </button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {filteredPrograms.map((program, index) => (
                <motion.div
                  key={program.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    navigate(`/modules/workout/workout-library/${program.id}`);
                    haptic.light();
                  }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 cursor-pointer hover:border-cyan-400/50 transition-all"
                >
                  {/* Hero Image */}
                  {program.hero_image_url ? (
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={program.hero_image_url}
                        alt={program.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      {program.is_featured && (
                        <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 text-black fill-black" />
                          <span className="text-xs font-bold text-black">Featured</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative h-32 bg-gradient-to-br from-cyan-500/20 to-purple-600/20">
                      {program.is_featured && (
                        <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 text-black fill-black" />
                          <span className="text-xs font-bold text-black">Featured</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-white mb-1">{program.name}</h3>
                    {program.description && (
                      <p className="text-sm text-white/60 line-clamp-2 mb-3">
                        {program.description}
                      </p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {program.difficulty && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            program.difficulty === 'beginner'
                              ? 'bg-green-500/20 text-green-400'
                              : program.difficulty === 'intermediate'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {program.difficulty}
                        </span>
                      )}
                      {program.goal && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400">
                          {program.goal}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {program.duration_weeks} weeks
                      </span>
                      {program.workouts_per_week && (
                        <span className="flex items-center gap-1">
                          <Dumbbell className="w-4 h-4" />
                          {program.workouts_per_week}x/week
                        </span>
                      )}
                      {(program.use_count ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {program.use_count} uses
                        </span>
                      )}
                    </div>

                    {/* Creator */}
                    {program.creator && (
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <Users className="w-3 h-3" />
                        by {program.creator.display_name || program.creator.username}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Filters Bottom Sheet */}
      <BottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Programs"
        height="auto"
      >
        <div className="space-y-4 pb-4">
          <div>
            <label className="block text-white font-medium mb-3">Goal</label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedGoal(option.value as GoalFilter);
                    haptic.light();
                  }}
                  className={`py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    selectedGoal === option.value
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <option.icon className="w-4 h-4" />
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
            Apply Filters
          </button>
        </div>
      </BottomSheet>

      {/* Program Detail Bottom Sheet - TODO: Implement full detail view */}
      <BottomSheet
        isOpen={selectedProgram !== null}
        onClose={() => setSelectedProgram(null)}
        title={selectedProgram?.name || ''}
        height="auto"
      >
        {selectedProgram && (
          <div className="space-y-3 pb-4">
            <div className="text-white/60 text-sm mb-4">
              {selectedProgram.description || 'No description available.'}
            </div>

            <button
              onClick={() => {
                toast('Schedule program feature coming soon!', { icon: '🚀' });
                haptic.medium();
              }}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Schedule Program
            </button>

            <button
              onClick={() => {
                toast('View details feature coming soon!', { icon: '👀' });
                haptic.light();
              }}
              className="w-full py-3 bg-white/10 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            >
              <Target className="w-5 h-5" />
              View Full Program
            </button>

            <button
              onClick={() => setSelectedProgram(null)}
              className="w-full py-3 bg-white/5 rounded-xl text-white/60 font-semibold"
            >
              Cancel
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default WorkoutLibraryPage;