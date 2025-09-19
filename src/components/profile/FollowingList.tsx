import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types/profile.types';
import { DirectMessageModal } from './DirectMessageModal';
import { UserCardModal } from './UserCardModal';
import { useNavigate } from 'react-router-dom';

export const FollowingList: React.FC = () => {
  const { user } = useAuth();
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showDM, setShowDM] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) loadFollowing();
    // eslint-disable-next-line
  }, [user]);

  const loadFollowing = async () => {
    setLoading(true);
    const { data: followers } = await supabase
      .from('followers')
      .select('following_id')
      .eq('follower_id', user.id);
    if (!followers) return setLoading(false);
    const ids = followers.map((f: any) => f.following_id);
    if (ids.length) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url')
        .in('id', ids);
      setFollowing(
        (profiles || []).map((p: any) => ({
          id: p.id,
          displayName: p.display_name,
          username: p.username,
          avatarUrl: p.avatar_url,
        }))
      );
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto p-4">
  <h2 className="text-xl font-bold mb-4 text-orange-500">Following</h2>
      {loading ? (
        <div>Loading...</div>
      ) : following.length === 0 ? (
        <div className="text-gray-500">You are not following anyone yet.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {following.map((user) => (
            <li key={user.id} className="flex items-start gap-3 py-3">
              <img src={user.avatarUrl || '/images/default-avatar.png'} alt={user.displayName || user.username} className="w-10 h-10 rounded-full object-cover border" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate text-gray-900 dark:text-white drop-shadow-md">{user.displayName || user.username}</div>
                <div className="text-xs truncate mb-2 text-gray-500 dark:text-gray-300 drop-shadow">@{user.username}</div>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm w-full sm:w-auto"
                    onClick={() => { setSelectedUser(user); setShowProfile(true); }}
                  >
                    View Profile
                  </button>
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded-full text-sm w-full sm:w-auto"
                    onClick={() => { setSelectedUser(user); setShowDM(true); }}
                  >
                    Message
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {selectedUser && showDM && (
        <DirectMessageModal
          isOpen={showDM}
          onClose={() => setShowDM(false)}
          recipientId={selectedUser.id}
          recipientName={selectedUser.displayName || selectedUser.username}
        />
      )}
      {selectedUser && showProfile && (
        <UserCardModal
          user={{
            ...selectedUser,
            hero_image_url: undefined,
            bio: selectedUser.bio,
            tags: [],
            badgesCount: undefined,
          }}
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
};
