import React from 'react';
import WorkoutModuleHero from './WorkoutModuleHero';

const WorkoutLibraryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <WorkoutModuleHero />
      {/* Add more Workout Module content here */}
    </div>
  );
};

export default WorkoutLibraryPage;
