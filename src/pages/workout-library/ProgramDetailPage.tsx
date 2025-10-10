import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  Clock,
  Target,
  Star,
  Users,
  TrendingUp,
  Play,
  Share2,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { WorkoutProgramsService } from '../../lib/workout-programs.service';
import { BottomSheet, useHaptic } from '../../components/ui/BottomSheet';

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

interface ProgramWorkout {
  id: string;
  program_id: string;
  workout_id: string;
  day_of_week: number;
  week_number: number;
  order_index: number;
  notes?: string;
  workout?: {
    name: string;
    description?: string;
    estimated_duration?: number;
    difficulty?: string;
  };
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ProgramDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const haptic = useHaptic();

  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [programWorkouts, setProgramWorkouts] = useState<ProgramWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleStartDate, setScheduleStartDate] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    if (id) {
      loadProgramDetails();
    }
  }, [id]);

  const loadProgramDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      // Load program details
      const { data: programData, error: programError } = await (supabase as any)
        .from('workout_programs')
        .select(`
          *,
          profiles!workout_programs_user_id_fkey (
            display_name,
            username
          )
        `)
        .eq('id', id)
        .single();

      if (programError) throw programError;

      const mappedProgram: WorkoutProgram = {
        id: programData.id,
        user_id: programData.user_id,
        name: programData.name,
        description: programData.description,
        duration_weeks: programData.duration_weeks,
        is_active: programData.is_active,
        is_public: programData.is_public,
        is_featured: programData.is_featured,
        difficulty: programData.difficulty,
        goal: programData.goal,
        workouts_per_week: programData.workouts_per_week,
        hero_image_url: programData.hero_image_url,
        like_count: programData.like_count || 0,
        use_count: programData.use_count || 0,
        created_at: programData.created_at,
        creator: programData.profiles ? {
          display_name: programData.profiles.display_name,
          username: programData.profiles.username,
        } : undefined,
      };

      setProgram(mappedProgram);

      // Load program workouts (if any exist)
      const { data: workoutsData, error: workoutsError } = await (supabase as any)
        .from('program_workouts')
        .select(`
          *,
          custom_workouts (
            name,
            description,
            estimated_duration,
            difficulty
          )
        `)
        .eq('program_id', id)
        .order('week_number', { ascending: true })
        .order('day_of_week', { ascending: true });

      if (!workoutsError && workoutsData) {
        setProgramWorkouts(workoutsData);
      }
    } catch (error) {
      console.error('Error loading program details:', error);
      toast.error('Failed to load program details');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleProgram = async () => {
    if (!program || !scheduleStartDate) {
      toast.error('Please select a start date');
      return;
    }

    setIsScheduling(true);
    haptic.medium();

    try {
      const success = await WorkoutProgramsService.scheduleProgram(
        program.id,
        scheduleStartDate
      );

      if (success) {
        toast.success(`${program.name} scheduled successfully!`);
        setShowScheduleModal(false);

        // Increment use count
        await (supabase as any)
          .from('workout_programs')
          .update({ use_count: (program.use_count || 0) + 1 })
          .eq('id', program.id);
      } else {
        toast.error('Failed to schedule program');
      }
    } catch (error) {
      console.error('Error scheduling program:', error);
      toast.error('Failed to schedule program');
    } finally {
      setIsScheduling(false);
    }
  };

  // Generate date options (today + next 60 days for program start)
  const dateOptions = Array.from({ length: 61 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isToday: i === 0,
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading program...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-10 h-10 text-white/40" />
          </div>
          <p className="text-white/60 mb-4">Program not found</p>
          <button
            onClick={() => navigate('/modules/workout/workout-library')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-semibold"
          >
            Back to Programs
          </button>
        </div>
      </div>
    );
  }

  // Get workouts for selected week
  const weekWorkouts = programWorkouts.filter(w => w.week_number === selectedWeek);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pb-20">
      {/* Header with Hero Image */}
      <div className="relative">
        {/* Hero Image */}
        {program.hero_image_url ? (
          <div className="relative h-64 overflow-hidden">
            <img
              src={program.hero_image_url}
              alt={program.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
        ) : (
          <div className="relative h-48 bg-gradient-to-br from-cyan-500/20 to-purple-600/20" />
        )}

        {/* Back Button */}
        <button
          onClick={() => navigate('/modules/workout/workout-library')}
          className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Featured Badge */}
        {program.is_featured && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 text-black fill-black" />
            <span className="text-xs font-bold text-black">Featured</span>
          </div>
        )}

        {/* Program Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">{program.name}</h1>
          <div className="flex flex-wrap gap-2">
            {program.difficulty && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  program.difficulty === 'beginner'
                    ? 'bg-green-500/90 text-white'
                    : program.difficulty === 'intermediate'
                    ? 'bg-yellow-500/90 text-black'
                    : 'bg-red-500/90 text-white'
                }`}
              >
                {program.difficulty}
              </span>
            )}
            {program.goal && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-cyan-500/90 text-white">
                {program.goal}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
            <Calendar className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{program.duration_weeks}</div>
            <div className="text-xs text-white/60">Weeks</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
            <Dumbbell className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{program.workouts_per_week || '3-5'}</div>
            <div className="text-xs text-white/60">x/Week</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
            <TrendingUp className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{program.use_count || 0}</div>
            <div className="text-xs text-white/60">Uses</div>
          </div>
        </div>

        {/* Description */}
        {program.description && (
          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-2">About This Program</h2>
            <p className="text-white/70 text-sm leading-relaxed">{program.description}</p>
          </div>
        )}

        {/* Creator */}
        {program.creator && (
          <div className="flex items-center gap-3 mb-6 bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-white/60">Created by</p>
              <p className="text-sm font-semibold text-white">
                {program.creator.display_name || program.creator.username}
              </p>
            </div>
          </div>
        )}

        {/* Week Selector */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3">Program Schedule</h2>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {Array.from({ length: program.duration_weeks }, (_, i) => i + 1).map((week) => (
              <button
                key={week}
                onClick={() => {
                  setSelectedWeek(week);
                  haptic.light();
                }}
                className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedWeek === week
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                Week {week}
              </button>
            ))}
          </div>
        </div>

        {/* Week Schedule */}
        <div className="space-y-3 mb-6">
          {programWorkouts.length > 0 ? (
            weekWorkouts.length > 0 ? (
              weekWorkouts.map((pw) => (
                <motion.div
                  key={pw.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-cyan-400 font-semibold mb-1">
                        {DAY_NAMES[pw.day_of_week]}
                      </p>
                      <p className="text-base font-bold text-white">
                        {pw.workout?.name || 'Workout'}
                      </p>
                    </div>
                    {pw.workout?.estimated_duration && (
                      <div className="flex items-center gap-1 text-xs text-white/60">
                        <Clock className="w-3 h-3" />
                        {pw.workout.estimated_duration}m
                      </div>
                    )}
                  </div>
                  {pw.workout?.description && (
                    <p className="text-sm text-white/60 mb-2">{pw.workout.description}</p>
                  )}
                  {pw.notes && (
                    <p className="text-xs text-purple-400 italic">{pw.notes}</p>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                <p className="text-white/60 text-sm">No workouts scheduled for Week {selectedWeek}</p>
              </div>
            )
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
              <Target className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60 text-sm mb-2">Program structure coming soon</p>
              <p className="text-white/40 text-xs">
                This is a template program. Workouts can be added using the Program Builder.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              setShowScheduleModal(true);
              haptic.medium();
            }}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <Calendar className="w-5 h-5" />
            Schedule This Program
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                toast('Share feature coming soon!', { icon: '🔗' });
                haptic.light();
              }}
              className="py-3 bg-white/5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 border border-white/10"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={() => {
                toast('Favorite feature coming soon!', { icon: '❤️' });
                haptic.light();
              }}
              className="py-3 bg-white/5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 border border-white/10"
            >
              <Heart className="w-4 h-4" />
              Favorite
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <BottomSheet
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Program"
        height="auto"
      >
        <div className="space-y-4 pb-4">
          <div>
            <label className="block text-white font-medium mb-3">Start Date</label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {dateOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setScheduleStartDate(option.value);
                    haptic.light();
                  }}
                  className={`p-3 rounded-xl text-sm font-semibold transition-all ${
                    scheduleStartDate === option.value
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  } ${option.isToday ? 'border-2 border-cyan-400' : ''}`}
                >
                  {option.isToday ? '📅 ' : ''}{option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3">
            <p className="text-cyan-400 text-sm flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                This will schedule all workouts from this {program.duration_weeks}-week program to your planner starting from the selected date.
              </span>
            </p>
          </div>

          <button
            onClick={handleScheduleProgram}
            disabled={!scheduleStartDate || isScheduling}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScheduling ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                Confirm & Schedule
              </>
            )}
          </button>

          <button
            onClick={() => setShowScheduleModal(false)}
            disabled={isScheduling}
            className="w-full py-3 bg-white/5 rounded-xl text-white/60 font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};

export default ProgramDetailPage;