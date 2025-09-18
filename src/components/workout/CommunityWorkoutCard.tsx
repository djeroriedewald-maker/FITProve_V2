import React from 'react';
import { Link } from 'react-router-dom';

export interface CommunityWorkoutCardProps {
  id: string;
  name: string;
  description: string;
  hero_image_url?: string;
  creator_name?: string;
  creator_username?: string;
}

export const CommunityWorkoutCard: React.FC<CommunityWorkoutCardProps> = ({
  id,
  name,
  description,
  hero_image_url,
  creator_name,
  creator_username,
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col">
    {hero_image_url && (
      <img src={hero_image_url} alt={name} className="w-full h-40 object-cover rounded-lg mb-4" />
    )}
    <h2 className="text-xl font-semibold mb-2">{name}</h2>
    <p className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-3">{description}</p>
    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
      Created by: <span className="font-medium">{creator_name || creator_username || 'Unknown'}</span>
    </div>
    <Link to={`/modules/workout/execute/${id}`} className="mt-auto inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-center font-semibold">Start Workout</Link>
  </div>
);
