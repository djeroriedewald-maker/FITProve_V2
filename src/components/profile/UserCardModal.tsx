
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { PublicUserProfile, followUser } from '../../lib/api';

interface UserCardModalProps {
  user: (PublicUserProfile & {
    hero_image_url?: string;
    bio?: string;
    tags?: string[];
    badgesCount?: number;
  }) | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserCardModal: React.FC<UserCardModalProps> = ({ user, isOpen, onClose }) => {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleAddFriend = async () => {
    setAdding(true);
    setError(null);
    try {
      const success = await followUser(user.id);
      if (success) {
        setAdded(true);
      } else {
        setError('Could not add friend.');
      }
    } catch (e) {
      setError('Could not add friend.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={undefined}>
      <div className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
        {/* Add Friend button top right */}
        <button
          className={`absolute top-4 right-4 z-40 px-5 py-2 rounded-lg font-bold shadow transition text-base ${added ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          onClick={handleAddFriend}
          disabled={adding || added}
        >
          {added ? 'Added' : adding ? 'Adding...' : 'Add Friend'}
        </button>
        {/* Hero section */}
        <div className="relative w-full h-48 md:h-56 bg-gray-800 flex items-end justify-center overflow-hidden">
          <img
            src={user.hero_image_url || '/images/gym_banner.webp'}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ zIndex: 1 }}
          />
        </div>
        {/* Avatar overlaps hero/content */}
        <div className="relative flex flex-col items-center -mt-16 z-30">
          <div className="relative">
            <img
              src={user.avatarUrl || '/default-avatar.svg'}
              alt={user.displayName}
              className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white shadow-2xl object-cover bg-white"
            />
            {typeof user.badgesCount === 'number' && user.badgesCount > 0 && (
              <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl z-40">
                <span className="text-white text-xl font-bold leading-none">{user.badgesCount}</span>
              </div>
            )}
          </div>
        </div>
        {/* Card content, clean and centered */}
        <div className="flex flex-col items-center justify-center pt-4 pb-8 px-6 bg-transparent">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 text-center drop-shadow-lg">{user.displayName}</h1>
          <div className="text-orange-100 text-base mb-2 font-semibold drop-shadow">@{user.username}</div>
          {user.bio && (
            <p className="mt-1 text-white/90 text-center text-base drop-shadow-md">{user.bio}</p>
          )}
          {user.tags && user.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {user.tags.map((tag: string, idx: number) => (
                <span
                  key={tag + idx}
                  className="px-4 py-1 text-base bg-orange-600/90 text-white rounded-full border border-orange-300 shadow font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
        </div>
      </div>
    </Modal>
  );
};
