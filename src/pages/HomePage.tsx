import React from 'react';
import { Heart, Dumbbell, Flame, Trophy, ArrowRight } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { UpcomingEvents } from '../components/ui/UpcomingEvents';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { SignInForm } from '../components/SignInForm';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
import { SyncButton } from '../components/ui/SyncButton';
import { ProfileMenu } from '../components/ui/ProfileMenu';

export const HomePage = () => {
  const upcomingEvents = [
    {
      id: '1',
      title: 'Morning HIIT Workout',
      date: new Date('2025-09-14'),
      type: 'workout' as const,
    },
    {
      id: '2',
      title: 'Weight Loss Goal Check',
      date: new Date('2025-09-15'),
      type: 'goal' as const,
    },
    {
      id: '3',
      title: '30-Day Challenge Complete',
      date: new Date('2025-09-16'),
      type: 'achievement' as const,
    },
  ];

  return (
    <div className="min-h-screen pt-16 pb-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              FITProve
            </h1>

            {/* Right side navigation items */}
            <div className="flex items-center space-x-6">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <NotificationDropdown />

              {/* Sync Button */}
              <SyncButton />

              {/* Profile/Avatar */}
              <ProfileMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0">
          <img
            src="/images/hero.webp"
            alt="Hero background"
            className="w-full h-full object-cover opacity-30 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 mix-blend-overlay" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              Transform Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 dark:from-primary dark:to-purple-400">
                Fitness Journey
              </span>
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-200 mb-8">
              Track, analyze, and improve your workouts with intelligent insights
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group">
                Get Started
                <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Dumbbell}
              title="Workouts Completed"
              value="24"
              trend={{ value: 12, isPositive: true }}
              description="This month"
              className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
              iconClassName="text-emerald-500"
            />
            <StatCard
              icon={Heart}
              title="Avg Heart Rate"
              value="128 BPM"
              description="Last workout"
              className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20"
              iconClassName="text-rose-500"
            />
            <StatCard
              icon={Flame}
              title="Calories Burned"
              value="12,450"
              trend={{ value: 8, isPositive: true }}
              description="This week"
              className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20"
              iconClassName="text-orange-500"
            />
            <StatCard
              icon={Trophy}
              title="Personal Records"
              value="5"
              description="New this month"
              className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20"
              iconClassName="text-purple-500"
            />
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20 bg-gradient-to-b from-transparent via-gray-50/50 to-gray-100/50 dark:from-transparent dark:via-gray-900/50 dark:to-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Events */}
            <div className="lg:col-span-2">
              <UpcomingEvents events={upcomingEvents} />
            </div>
            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="p-8 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
                  Quick Actions
                </h3>
                <div className="space-y-4">
                  <button className="w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary to-purple-600 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                    Start New Workout
                  </button>
                  <button className="w-full px-4 py-3 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                    View Progress
                  </button>
                  <button className="w-full px-4 py-3 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                    Set New Goal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};