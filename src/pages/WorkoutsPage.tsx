import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Clock, Calendar, Dumbbell, Play, Target, Zap, Star } from 'lucide-react';
import { WorkoutCreatorService } from '../lib/workout-creator.service';
import { CustomWorkout } from '../types/workout-creator.types';
import { GlassCard, GlassButton } from '../components/ui/GlassCard';
import { WorkoutCard } from '../components/ui/WorkoutCard';

export function WorkoutsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);
  const [workouts, setWorkouts] = useState<CustomWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading user workouts...');
      
      const userWorkouts = await WorkoutCreatorService.getUserWorkouts();
      console.log('✅ Loaded workouts:', userWorkouts);
      
      setWorkouts(userWorkouts);
    } catch (err) {
      console.error('❌ Error loading workouts:', err);
      setError('Failed to load workouts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <GlassCard variant="hero" className="p-12">
            <h1 className="text-4xl font-bold text-white mb-8">My Workouts</h1>
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                className="w-3 h-3 bg-primary rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.div
                className="w-3 h-3 bg-secondary rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-3 h-3 bg-accent rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </div>
            <p className="text-white/70 mt-4">Loading your amazing workouts...</p>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard variant="workout" className="p-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-6">My Workouts</h1>
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-400 text-lg">{error}</p>
            </div>
            <GlassButton onClick={loadWorkouts}>
              Try Again
            </GlassButton>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            My Workouts
          </h1>
          <p className="text-white/70">Your personalized fitness journey</p>
        </div>
        
        <GlassButton onClick={() => window.location.href = "/modules/workout/workout-creator"}>
          <Plus className="w-5 h-5 mr-2" />
          Create Workout
        </GlassButton>
      </motion.div>

      {/* Workout Generator Feature Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Link to="/workout-generator">
          <GlassCard variant="workout" className="p-6 group cursor-pointer">
            <div className="flex items-center gap-6">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="p-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl backdrop-blur-xl border border-white/20"
              >
                <Target className="w-12 h-12 text-primary" />
              </motion.div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                  ✨ Workout Generator
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Let us build a workout for you with our smart onboarding flow. Answer a few questions and get a personalized plan!
                </p>
                
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">AI Powered</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">Personalized</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </Link>
      </motion.div>

      {/* Workouts Grid */}
      {workouts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassCard variant="workout" className="p-12 text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto">
                <Dumbbell className="w-10 h-10 text-primary" />
              </div>
            </motion.div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              No workouts yet
            </h3>
            <p className="text-white/70 mb-8 max-w-md mx-auto leading-relaxed">
              Create your first workout to get started on your fitness journey! Build custom routines that match your goals.
            </p>
            
            <GlassButton 
              size="lg"
              onClick={() => window.location.href = "/modules/workout/workout-creator"}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Workout
            </GlassButton>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {workouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <GlassCard variant="workout" className="h-full group cursor-pointer">
                <div className="p-6 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white truncate group-hover:text-primary transition-colors">
                        {workout.name || 'Untitled Workout'}
                      </h3>
                      
                      {workout.description && (
                        <p className="text-white/70 text-sm mt-2 line-clamp-2">
                          {workout.description}
                        </p>
                      )}
                    </div>
                    
                    <div className={`px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                      workout.difficulty === 'beginner'
                        ? 'bg-green-400/20 text-green-300 border border-green-400/30'
                        : workout.difficulty === 'intermediate'
                        ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30'
                        : 'bg-red-400/20 text-red-300 border border-red-400/30'
                    }`}>
                      {workout.difficulty || 'Unknown'}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4">
                    {typeof workout.estimated_duration === 'number' && (
                      <div className="flex items-center gap-1 text-white/70">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{workout.estimated_duration} min</span>
                      </div>
                    )}
                    {workout.created_at && (
                      <div className="flex items-center gap-1 text-white/70">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{new Date(workout.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {workout.tags && workout.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {workout.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-glass-white-light text-white/80 text-xs rounded-full border border-white/20"
                        >
                          {tag}
                        </span>
                      ))}
                      {workout.tags.length > 3 && (
                        <span className="px-2 py-1 bg-glass-white-light text-white/60 text-xs rounded-full border border-white/20">
                          +{workout.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-auto">
                    <GlassButton variant="primary" className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </GlassButton>
                    <GlassButton variant="secondary" className="flex-1">
                      Edit
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

