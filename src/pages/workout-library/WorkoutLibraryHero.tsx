import React, { useEffect, useState } from 'react';
import { ExerciseService } from '../../lib/exercise.service';


const WorkoutLibraryHero: React.FC = () => {
  const [exerciseCount, setExerciseCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      const result = await ExerciseService.getExercises({ page: 1, pageSize: 1 });
      setExerciseCount(result.total_count);
    }
    fetchCount();
  }, []);

  return (
    <section className="w-full relative flex flex-col items-center justify-center p-0 m-0">
      {/* Truly full-width and centered hero image */}
      <div className="relative left-1/2 right-1/2 -translate-x-1/2 w-screen h-72 md:h-96 lg:h-[420px] overflow-hidden">
        <img
          src="/images/workout_duo.webp"
          alt="Workout Module Hero"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Brighter overlay */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 text-center drop-shadow-lg">
            Workout Module
          </h1>
        </div>
      </div>
      {/* Description below hero */}
      <div className="w-full max-w-2xl mx-auto px-4 mt-8">
        <p className="text-lg md:text-xl text-gray-800 dark:text-gray-100 text-center max-w-2xl mb-6 mx-auto">
          Discover your path to fitness with tailored programs for every goal.<br />
          Whether you want to lose fat, build muscle, boost performance, improve health, or join a supportive community—our Workout Library has you covered.<br />
          Explore expert-designed routines and find the perfect fit for your lifestyle and ambitions.
        </p>
      </div>
    </section>
  );
};

export default WorkoutLibraryHero;
