import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types/profile.types';
import { DirectMessageModal } from './DirectMessageModal';
import { useNavigate } from 'react-router-dom';

export const FollowingList: React.FC = () => {
  const { user } = useAuth();
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showDM, setShowDM] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) loadFollowing();
    // eslint-disable-next-line
  }, [user]);

  const loadFollowing = async () => {
    setLoading(true);
    const { data: follows } = await supabase
      .from('follows')
      .select('followed_id')
      .eq('follower_id', user.id);
    if (!follows) return setLoading(false);
    const ids = follows.map((f: any) => f.followed_id);
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
      <h2 className="text-xl font-bold mb-4">Following</h2>
      {loading ? (
        <div>Loading...</div>
      ) : following.length === 0 ? (
        <div className="text-gray-500">You are not following anyone yet.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {following.map((user) => (
            <li key={user.id} className="flex items-center gap-3 py-3">
              <img src={user.avatarUrl || '/images/default-avatar.png'} alt={user.displayName || user.username} className="w-10 h-10 rounded-full object-cover border" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{user.displayName || user.username}</div>
                <div className="text-xs text-gray-500 truncate">@{user.username}</div>
              </div>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm mr-2"
                onClick={() => navigate(`/profile/${user.username}`)}
              >
                View Profile
              </button>
              <button
                className="px-3 py-1 bg-green-600 text-white rounded-full text-sm"
                onClick={() => { setSelectedUser(user); setShowDM(true); }}
              >
                Message
              </button>
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
    </div>
  );
};
