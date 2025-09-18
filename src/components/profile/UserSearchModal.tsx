import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { searchPublicProfiles, PublicUserProfile } from '../../lib/api';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelected?: (user: PublicUserProfile) => void;
}

export const UserSearchModal: React.FC<UserSearchModalProps> = ({ isOpen, onClose, onUserSelected }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicUserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const found = await searchPublicProfiles(query);
      setResults(found);
    } catch (err) {
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Find Users">
      <>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            className="flex-1 px-3 py-2 border rounded-lg"
            placeholder="Search by name or username"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <ul className="divide-y divide-gray-200">
          {results.map((user) => (
            <li key={user.id} className="py-2 flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold">{user.displayName}</div>
                <div className="text-sm text-gray-500">@{user.username}</div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                  onClick={() => onUserSelected && onUserSelected(user)}
                >
                  View
                </button>
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded-full text-sm"
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    try {
                      const { followUser } = await import('../../lib/api');
                      const success = await followUser(user.id);
                      if (success) {
                        setError('Followed!');
                      } else {
                        setError('Could not follow user.');
                      }
                    } catch (e) {
                      setError('Could not follow user.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  Follow
                </button>
              </div>
            </li>
          ))}
          {!loading && results.length === 0 && (
            <li className="py-2 text-gray-500 text-center">No users found</li>
          )}
        </ul>
      </>
    </Modal>
  );
};
