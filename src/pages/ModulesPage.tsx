import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Utensils, Heart, Brain, ArrowRight, Star, Clock, Users } from 'lucide-react';

interface ModuleCategory {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  stats: {
    exercises?: number;
    workouts?: number;
    recipes?: number;
    sessions?: number;
    duration?: string;
  };
  comingSoon?: boolean;
}

const moduleCategories: ModuleCategory[] = [
  {
    id: 'workout',
    title: 'Workout',
    description: 'Exercise library and workout programs to build strength, endurance, and achieve your fitness goals.',
    image: '/images/workout_1.webp',
    icon: Dumbbell,
    color: 'text-orange-600',
    gradient: 'from-orange-500/20 to-red-500/20',
    stats: {
      exercises: 150,
      workouts: 45,
      duration: '15-60 min'
    }
  },
  {
    id: 'nutrition',
    title: 'Nutrition',
    description: 'Healthy recipes, meal plans, and nutrition guidance to fuel your body optimally.',
    image: '/images/food.webp',
    icon: Utensils,
    color: 'text-green-600',
    gradient: 'from-green-500/20 to-emerald-500/20',
    stats: {
      recipes: 200,
      duration: '10-45 min'
    },
    comingSoon: true
  },
  {
    id: 'recovery',
    title: 'Recovery',
    description: 'Stretching routines, mobility exercises, and recovery techniques for optimal performance.',
    image: '/images/recovering.webp',
    icon: Heart,
    color: 'text-blue-600',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    stats: {
      sessions: 80,
      duration: '5-30 min'
    },
    comingSoon: true
  },
  {
    id: 'zen',
    title: 'Zen',
    description: 'Meditation practices, yoga sessions, and mindfulness exercises for mental wellness.',
    image: '/images/mindset.webp',
    icon: Brain,
    color: 'text-purple-600',
    gradient: 'from-purple-500/20 to-indigo-500/20',
    stats: {
      sessions: 60,
      duration: '5-45 min'
    },
    comingSoon: true
  }
];

function ModuleCard({ module }: { module: ModuleCategory }) {
  const Icon = module.icon;
  
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Background Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={module.image}
          alt={module.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${module.gradient} to-transparent`} />
        
        {/* Coming Soon Badge */}
        {module.comingSoon && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400/90 text-yellow-900 text-xs font-semibold rounded-full">
            Coming Soon
          </div>
        )}
        
        {/* Icon */}
        <div className="absolute top-4 left-4">
          <div className="p-3 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm">
            <Icon className={`h-6 w-6 ${module.color}`} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {module.title}
          </h3>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {module.description}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
          {module.stats.exercises && (
            <div className="flex items-center gap-1">
              <Dumbbell className="h-3 w-3" />
              <span>{module.stats.exercises} exercises</span>
            </div>
          )}
          {module.stats.workouts && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span>{module.stats.workouts} workouts</span>
            </div>
          )}
          {module.stats.recipes && (
            <div className="flex items-center gap-1">
              <Utensils className="h-3 w-3" />
              <span>{module.stats.recipes} recipes</span>
            </div>
          )}
          {module.stats.sessions && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{module.stats.sessions} sessions</span>
            </div>
          )}
          {module.stats.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{module.stats.duration}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
    </div>
  );
}

export function ModulesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Training Modules
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Discover comprehensive training programs designed to transform your fitness journey. 
            From strength building to mindful wellness, find the perfect module for your goals.
          </p>
          
          {/* Module Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-orange-600">150+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Exercises</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">200+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Recipes</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">80+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Recovery Sessions</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">60+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Zen Sessions</div>
            </div>
          </div>
        </div>

        {/* Module Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {moduleCategories.map((module) => (
            <Link
              key={module.id}
              to={`/modules/${module.id}`}
              className={`block ${module.comingSoon ? 'pointer-events-none' : ''}`}
            >
              <ModuleCard module={module} />
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Begin with our workout module featuring expertly crafted exercise routines. 
              More modules coming soon to complete your wellness journey!
            </p>
            <Link
              to="/modules/workout"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              <Dumbbell className="h-5 w-5" />
              Start with Workouts
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}