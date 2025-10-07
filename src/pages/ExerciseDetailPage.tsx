// src/routes/modules/exercises/[id].tsx (or wherever this page lives)
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Target,
  BarChart3,
  Dumbbell,
  Play,
  Info,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Exercise } from '../types/exercise.types';

// Animated metric circle component
function MetricCircle({
  value,
  max,
  color,
  label,
  desc,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  desc: string;
}) {
  const percentage = (value / max) * 100;
  const strokeDasharray = 188.5;
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray;

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-20 h-20 mx-auto mb-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="30"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-white/20"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="30"
            stroke={color}
            strokeWidth="4"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: strokeDasharray }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ color }} className="font-bold text-sm">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <p className="text-white/60 text-xs">{label}</p>
      <p className="text-white/80 text-xs font-medium">{desc}</p>
    </motion.div>
  );
}

const ExerciseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab] = useState<'overview' | 'instructions' | 'tips' | 'variations' | 'analytics'>(
    'overview'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [exercise, setExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .or(`id.eq.${id},slug.eq.${id},name.eq.${id}`)
          .single();

        if (error) {
          console.error('Error fetching exercise:', error);
          setExercise(null);
        } else {
          setExercise(data as Exercise);
        }
      } catch (err) {
        console.error('Error fetching exercise:', err);
        setExercise(null);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchExercise, 300);
    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-8">
          <motion.div
            className="w-20 h-20 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 shadow-cyan-glow"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/80 font-medium"
          >
            Loading exercise data...
          </motion.div>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          className="p-8 max-w-md mx-4 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/20 shadow-cyan-glow"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Exercise Not Found</h2>
            <p className="text-white/70 mb-6">The exercise you are looking for does not exist.</p>
            <button
              onClick={() => navigate('/modules/workout/exercise-library')}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Exercises
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // KPI metrics (demo values) — compute once after exercise loads
  let difficultyScore = 5, intensityScore = 5, popularityScore = 50, completionRate = 80;
  if (exercise) {
    difficultyScore = exercise.difficulty === 'beginner'
      ? 3
      : exercise.difficulty === 'intermediate'
        ? 6
        : exercise.difficulty
          ? 9
          : 5;
    intensityScore = Math.floor(Math.random() * 10) + 1;
    popularityScore = Math.floor(Math.random() * 100) + 1;
    completionRate = Math.floor(Math.random() * 40) + 60;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'instructions', label: 'How To', icon: CheckCircle },
    { id: 'tips', label: 'Pro Tips', icon: Sparkles },
    { id: 'variations', label: 'Variations', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ] as const;

  const primaryMuscles = Array.isArray(exercise.primary_muscles) ? exercise.primary_muscles : [];
  const equipment = Array.isArray(exercise.equipment) ? exercise.equipment : [];
  const instructions = Array.isArray(exercise.instructions) ? exercise.instructions : [];
  const tips = Array.isArray(exercise.tips) ? exercise.tips : [];
  const mistakes = Array.isArray(exercise.common_mistakes)
    ? exercise.common_mistakes
    : exercise.common_mistakes
      ? [exercise.common_mistakes]
      : [];
  const variations = Array.isArray(exercise.variations)
    ? exercise.variations
    : exercise.variations
      ? [exercise.variations]
      : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.div
        className="relative overflow-hidden bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-sm border-b border-white/10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/modules/workout/exercise-library')}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex-1">
              <motion.h1
                className="text-2xl md:text-3xl font-bold text-white mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {exercise.name}
              </motion.h1>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <motion.div
              className="overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/20 shadow-cyan-glow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative aspect-video bg-gradient-to-br from-cyan-500/20 to-purple-500/20 overflow-hidden">
                {/* Show image, GIF, or YouTube video if available */}
                {exercise.image_url ? (
                  <img
                    src={exercise.image_url}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                ) : exercise.gif_url ? (
                  <img
                    src={exercise.gif_url}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                ) : exercise.youtube_id ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${exercise.youtube_id}`}
                    title={exercise.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Dumbbell className="w-24 h-24 text-white/40" />
                  </div>
                )}

                {/* YouTube button overlay */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    window.open(
                      `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + ' exercise')}`,
                      '_blank'
                    )
                  }
                  className="absolute bottom-6 right-6 bg-gradient-to-tr from-red-600 to-orange-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 font-bold text-lg hover:from-red-700 hover:to-orange-600 transition-all"
                >
                  <Play className="w-6 h-6" />
                  Watch on YouTube
                </motion.button>
              </div>
            </motion.div>

            {/* KPI Dashboard */}
            <motion.div
              className="p-6 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/20 shadow-purple-glow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Exercise Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Difficulty */}
                <MetricCircle
                  value={difficultyScore}
                  max={10}
                  color="#06b6d4"
                  label="Difficulty"
                  desc={exercise.difficulty ?? '-'}
                />
                {/* Intensity */}
                <MetricCircle
                  value={intensityScore}
                  max={10}
                  color="#a855f7"
                  label="Intensity"
                  desc="High Impact"
                />
                {/* Popularity */}
                <MetricCircle
                  value={popularityScore}
                  max={100}
                  color="#f97316"
                  label="Popularity"
                  desc="Trending"
                />
                {/* Success */}
                <MetricCircle
                  value={completionRate}
                  max={100}
                  color="#10b981"
                  label="Success"
                  desc="Complete Rate"
                />
              </div>
            </motion.div>

            {/* Info Section: Muscles, Equipment, Instructions, Tips, Variations, Mistakes */}
            <motion.div
              className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/20 shadow-cyan-glow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-400" />
                Exercise Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Muscles */}
                <div>
                  <h4 className="text-white/80 font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    Primary Muscles
                  </h4>
                  <ul className="list-disc list-inside text-white/70 text-sm">
                    {primaryMuscles.length > 0 ? (
                      primaryMuscles.map((m, i) => <li key={i}>{m}</li>)
                    ) : (
                      <li>None</li>
                    )}
                  </ul>
                </div>
                {/* Equipment */}
                <div>
                  <h4 className="text-white/80 font-semibold mb-2 flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-purple-400" />
                    Equipment
                  </h4>
                  <ul className="list-disc list-inside text-white/70 text-sm">
                    {equipment.length > 0 ? (
                      equipment.map((e, i) => <li key={i}>{e}</li>)
                    ) : (
                      <li>None</li>
                    )}
                  </ul>
                </div>
                {/* Instructions */}
                <div className="md:col-span-2">
                  <h4 className="text-white/80 font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Instructions
                  </h4>
                  <ol className="list-decimal list-inside text-white/70 text-sm space-y-1">
                    {instructions.length > 0 ? (
                      instructions.map((step, i) => <li key={i}>{step}</li>)
                    ) : (
                      <li>None</li>
                    )}
                  </ol>
                </div>
                {/* Tips */}
                <div>
                  <h4 className="text-white/80 font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    Pro Tips
                  </h4>
                  <ul className="list-disc list-inside text-white/70 text-sm">
                    {tips.length > 0 ? tips.map((tip, i) => <li key={i}>{tip}</li>) : <li>None</li>}
                  </ul>
                </div>
                {/* Variations */}
                <div>
                  <h4 className="text-white/80 font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    Variations
                  </h4>
                  <ul className="list-disc list-inside text-white/70 text-sm">
                    {variations.length > 0 ? (
                      variations.map((v, i) => <li key={i}>{v}</li>)
                    ) : (
                      <li>None</li>
                    )}
                  </ul>
                </div>
                {/* Mistakes */}
                <div>
                  <h4 className="text-white/80 font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Common Mistakes
                  </h4>
                  <ul className="list-disc list-inside text-white/70 text-sm">
                    {mistakes.length > 0 ? (
                      mistakes.map((m, i) => <li key={i}>{m}</li>)
                    ) : (
                      <li>None</li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* (Optional) Right column could hold tabs, related exercises, etc. */}
          <div className="lg:col-span-1 space-y-8">{/* Placeholder for future content */}</div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailPage;
