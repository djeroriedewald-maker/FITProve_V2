import React from 'react';
import WorkoutLibraryHero from './WorkoutLibraryHero';
import WorkoutGoalCards from './WorkoutGoalCards';

const WorkoutLibraryPage: React.FC = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-gray-900">
      <WorkoutLibraryHero />
      <WorkoutGoalCards />
    </div>
  );
};

export default WorkoutLibraryPage;
