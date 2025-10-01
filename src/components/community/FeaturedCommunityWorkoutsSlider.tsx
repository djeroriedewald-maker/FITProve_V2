import React from 'react';
import { FeaturedCommunityWorkoutCard } from './FeaturedCommunityWorkoutCard';

const mockWorkouts = [
  {
    title: 'Full Body HIIT Blast',
    author: 'Jane Doe',
    image: '/images/community_workout.webp',
  },
  {
    title: 'Strength & Power',
    author: 'John Smith',
    image: '/images/community_workout1.webp',
  },
  {
    title: 'Cardio Burnout',
    author: 'Alex Lee',
    image: '/images/community_challenge.webp',
  },
  {
    title: 'Core Crusher',
    author: 'Sam Green',
    image: '/images/community.webp',
  },
  {
    title: 'Mobility Flow',
    author: 'Chris Kim',
    image: '/images/hero_1.webp',
  },
];

export const FeaturedCommunityWorkoutsSlider: React.FC = () => {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xl sm:text-2xl font-semibold text-white dark:text-white">Featured Community Workouts</h3>
        {/* Optionally add a 'See all' link here */}
      </div>
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-4 px-1" style={{ minWidth: 0 }}>
          {mockWorkouts.map((w, i) => (
            <FeaturedCommunityWorkoutCard key={i} {...w} />
          ))}
        </div>
      </div>
    </section>
  );
};
