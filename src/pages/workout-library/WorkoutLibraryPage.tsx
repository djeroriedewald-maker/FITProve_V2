import React from 'react';
import { useNavigate } from 'react-router-dom';
import WorkoutLibraryHero from './WorkoutLibraryHero';
import WorkoutGoalCards from './WorkoutGoalCards';

const WorkoutLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-gray-900">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 mt-4 ml-4 flex items-center gap-2 px-4 py-2 rounded-lg border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-fit"
        aria-label="Go back"
      >
        <span className="text-xl">←</span> Back
      </button>
      <WorkoutLibraryHero />
      <WorkoutGoalCards />
    </div>
  );
};

export default WorkoutLibraryPage;
