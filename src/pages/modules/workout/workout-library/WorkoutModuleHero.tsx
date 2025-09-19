import React from 'react';

const WorkoutModuleHero: React.FC = () => {
  return (
    <section className="w-full relative flex flex-col items-center justify-center py-0">
      <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden flex items-center justify-center">
        <img
          src="/images/workout_duo.webp"
          alt="Workout Module Hero"
          className="absolute inset-0 w-full h-full object-cover rounded-xl"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold text-white text-center drop-shadow-lg">
          Workout Module
        </h1>
      </div>
      <div className="flex flex-col items-center w-full mt-8">
        <p className="text-lg md:text-xl text-gray-800 dark:text-gray-100 text-center max-w-2xl mb-6">
          Transform your fitness journey with our comprehensive workout system.
          <br />
          Individual exercises to complete routines and custom workout creation.
        </p>
      </div>
    </section>
  );
};

export default WorkoutModuleHero;
