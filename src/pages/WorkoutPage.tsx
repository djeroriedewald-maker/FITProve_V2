import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Dumbbell, 
  Library, 
  Zap, 
  Plus, 
  ArrowRight, 
  Clock, 
  Target, 
  TrendingUp,
  Flame,
  BookOpen,
  Wrench
} from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';

interface WorkoutCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  features: string[];
  stats: {
    count: number;
    label: string;
  };
  comingSoon?: boolean;
}

const workoutCategories: WorkoutCategory[] = [
  {
    id: 'exercise-library',
    title: 'Exercise Library',
    description: 'Comprehensive collection of exercises with detailed instructions, proper form guidance, and muscle targeting information.',
    icon: Library,
    color: 'text-blue-600',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    features: [
      'Detailed exercise instructions',
      'Proper form guidance',
      'Muscle group targeting',
      'Difficulty levels',
      'Equipment requirements',
      'Video demonstrations'
    ],
    stats: {
      count: 800,
      label: 'Exercises'
    }
  },
  {
    id: 'workout-library',
    title: 'Workout Library',
    description: 'Pre-designed complete workout routines created by fitness experts for different goals and fitness levels.',
    icon: BookOpen,
    color: 'text-green-600',
    gradient: 'from-green-500/20 to-emerald-500/20',
    features: [
      'Expert-designed routines',
      'Goal-specific workouts',
      'Progressive difficulty',
      'Time-efficient sessions',
      'Equipment variations',
      'Performance tracking'
    ],
    stats: {
      count: 45,
      label: 'Workouts'
    }
  },
  {
    id: 'workout-creator',
    title: 'Workout Creator',
    description: 'Build custom workout routines by selecting exercises from our library. Perfect for creating personalized training sessions.',
    icon: Wrench,
    color: 'text-purple-600',
    gradient: 'from-purple-500/20 to-indigo-500/20',
    features: [
      'Drag & drop interface',
      'Custom exercise selection',
      'Set and rep customization',
      'Rest time configuration',
      'Save personal routines',
      'Share with community'
    ],
    stats: {
      count: 0,
      label: 'Custom Workouts'
    },
    comingSoon: true
  }
];

function WorkoutCategoryCard({ category }: { category: WorkoutCategory }) {
  const Icon = category.icon;
  
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Background Pattern */}
      <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-50`} />
      
      {/* Coming Soon Badge */}
      {category.comingSoon && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400/90 text-yellow-900 text-xs font-semibold rounded-full z-10">
          Coming Soon
        </div>
      )}
      
      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm`}>
            <Icon className={`h-8 w-8 ${category.color}`} />
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${category.color}`}>
              {category.stats.count}+
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {category.stats.label}
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {category.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {category.description}
        </p>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {category.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${category.gradient.replace('from-', 'from-').replace('to-', 'to-').replace('/20', '')}`} />
              <span>{feature}</span>
            </div>
          ))}
          {category.features.length > 3 && (
            <div className="text-xs text-gray-500 dark:text-gray-500 ml-3">
              +{category.features.length - 3} more features
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>5-60 min</span>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
    </div>
  );
}

export function WorkoutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <BackButton text="Back to Modules" to="/modules" />
      </div>
      
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        <img
          src="/images/workout_1.webp"
          alt="Workout"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 pb-12 w-full">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Workout Module
              </h1>
              <p className="text-xl text-gray-200 mb-6">
                Transform your fitness journey with our comprehensive workout system. 
                From individual exercises to complete routines and custom workout creation.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                  <Dumbbell className="h-5 w-5" />
                  <span className="font-semibold">800+ Exercises</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                  <Target className="h-5 w-5" />
                  <span className="font-semibold">45+ Workouts</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">All Levels</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-orange-600 mb-1">800+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Exercises</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600 mb-1">45+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Workouts</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600 mb-1">8</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-purple-600 mb-1">∞</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Possibilities</div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Choose Your Workout Experience
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workoutCategories.map((category) => (
              <Link
                key={category.id}
                to={`/modules/workout/${category.id}`}
                className={`block ${category.comingSoon ? 'pointer-events-none' : ''}`}
              >
                <WorkoutCategoryCard category={category} />
              </Link>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Workout System?</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Built by fitness experts and designed for real results
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Flame className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Expert Designed</h3>
              <p className="text-sm opacity-90">Created by certified trainers and fitness professionals</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Goal Oriented</h3>
              <p className="text-sm opacity-90">Workouts tailored to your specific fitness objectives</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Progressive</h3>
              <p className="text-sm opacity-90">Structured progression to ensure continuous improvement</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Start Your Workout Journey?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Begin with our exercise library to learn proper form, or jump into a complete workout routine. 
            The choice is yours!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/modules/workout/exercise-library"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors duration-200"
            >
              <Library className="h-5 w-5" />
              Explore Exercises
            </Link>
            <Link
              to="/modules/workout/workout-library"
              className="inline-flex items-center gap-2 bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
            >
              <BookOpen className="h-5 w-5" />
              Browse Workouts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}