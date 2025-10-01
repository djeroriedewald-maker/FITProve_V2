import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../ui/Modal';

export interface CommunityWorkoutCardProps {
  id: string;
  name: string;
  description: string;
  hero_image_url?: string;
  creator_name?: string;
  creator_username?: string;
  tags?: string[];
  exercises?: Array<{
    name: string;
    sets: number;
    reps: number;
  }>;
}

export const CommunityWorkoutCard: React.FC<CommunityWorkoutCardProps> = ({
  id,
  name,
  description,
  hero_image_url,
  creator_name,
  creator_username,
  tags = [],
  exercises,
}) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
  <div className="bg-white dark:bg-black rounded-xl shadow p-6 flex flex-col">
        {hero_image_url && (
          <img
            src={hero_image_url}
            alt={name}
            className="w-full h-40 object-cover rounded-lg mb-4"
          />
        )}
  <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{name}</h2>
  <p className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-3">{description}</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-neon-yellow/20 text-neon-yellow rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Created by:{' '}
          <span className="font-medium">{creator_name || creator_username || 'Unknown'}</span>
        </div>
        <div className="flex gap-2 mt-auto">
          <button
            className="inline-block px-4 py-2 bg-neon-yellow text-black rounded-lg hover:bg-yellow-300 transition-colors text-center font-semibold shadow-neon"
            onClick={() => setShowModal(true)}
          >
            See workout
          </button>
          <Link
            to={`/modules/workout/execute/${id}`}
            className="inline-block px-4 py-2 bg-neon-yellow text-black rounded-lg hover:bg-yellow-300 transition-colors text-center font-semibold shadow-neon"
          >
            Start Workout
          </Link>
        </div>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={name + ' - Exercises'}>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-2">Workout details</h2>
          <ul className="mb-4">
            {exercises && exercises.length > 0 ? (
              exercises.map((ex, idx) => (
                <li key={idx} className="mb-2">
                  <span className="font-semibold">{ex.name}</span>: {ex.sets} sets x {ex.reps} reps
                </li>
              ))
            ) : (
              <li>No exercises found for this workout.</li>
            )}
          </ul>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};
