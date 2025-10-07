import React from 'react';

const WorkoutModuleHero: React.FC = () => {
  return (
    <section className="w-full flex flex-col items-center justify-center py-0">
      <div className="relative w-full min-h-[22rem] sm:min-h-[28rem] md:min-h-[32rem] rounded-xl overflow-hidden flex items-center justify-center py-8">
        <img
          src="/images/workout_hero1.webp"
          alt="People training with weights in a gym"
          className="absolute inset-0 w-full h-full object-cover rounded-xl"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />

        {/* Gradient overlay (non-interactive) */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(135deg, rgba(124,58,237,0.55) 0%, rgba(236,72,153,0.45) 50%, rgba(59,130,246,0.55) 100%)',
          }}
        />

        {/* Foreground content */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center h-full px-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center drop-shadow-lg mb-4">
            Workout Module
          </h1>

          <p className="text-lg md:text-xl text-white text-center max-w-2xl mb-6 drop-shadow">
            Transform your fitness journey with our comprehensive workout system.<br />
            Individual exercises to complete routines and custom workout creation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center items-center mb-8">
            <button
              type="button"
              className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg transition-all w-full sm:w-auto"
            >
              Pro Programs
            </button>
            <button
              type="button"
              className="px-6 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow-lg transition-all w-full sm:w-auto"
            >
              Fast Results
            </button>
            <button
              type="button"
              className="px-6 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg transition-all w-full sm:w-auto"
            >
              Community
            </button>
          </div>

          {/* Primary CTA */}
          <div className="w-full flex justify-center items-center mb-10 mt-2">
            <button
              type="button"
              className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold shadow-xl text-lg flex items-center gap-2"
              aria-label="Get started with workouts now"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>

      {/* KPI/Stats Section */}
      <div className="w-full max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 mb-4 z-10 relative">
        <div className="bg-black/70 rounded-xl p-4 flex flex-col items-center shadow-lg">
          <span className="text-xs text-gray-300 mb-1">Active Users</span>
          <span className="text-xl font-bold text-pink-400">2.5k+</span>
        </div>
        <div className="bg-black/70 rounded-xl p-4 flex flex-col items-center shadow-lg">
          <span className="text-xs text-gray-300 mb-1">Total Workouts</span>
          <span className="text-xl font-bold text-blue-400">15k+</span>
        </div>
        <div className="bg-black/70 rounded-xl p-4 flex flex-col items-center shadow-lg">
          <span className="text-xs text-gray-300 mb-1">Calories Burned</span>
          <span className="text-xl font-bold text-red-400">1.2M+</span>
        </div>
        <div className="bg-black/70 rounded-xl p-4 flex flex-col items-center shadow-lg">
          <span className="text-xs text-gray-300 mb-1">Goals Achieved</span>
          <span className="text-xl font-bold text-yellow-400">8.5k+</span>
        </div>
      </div>
    </section>
  );
};

export default WorkoutModuleHero;
