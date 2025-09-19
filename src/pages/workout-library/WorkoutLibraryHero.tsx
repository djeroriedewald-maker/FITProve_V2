import React from 'react';

const WorkoutLibraryHero: React.FC = () => {
  return (
    <section className="w-full flex flex-col items-center justify-center py-12">
      <img
        src="/images/workout_duo.webp"
        alt="Workout Library Hero"
        className="max-w-2xl w-full rounded-xl shadow-lg mb-8"
        loading="eager"
      />
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 text-center">
        Welcome to the Workout Library
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 text-center max-w-2xl">
        Discover, explore, and get inspired by a curated collection of workouts for every goal and fitness level. Start your journey today!
      </p>
    </section>
  );
};

export default WorkoutLibraryHero;
