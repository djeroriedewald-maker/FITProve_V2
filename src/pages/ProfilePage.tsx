
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Badge } from '../components/profile/BadgesGrid';
import { UserProfile } from '../components/profile/UserProfile';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [userBadges, setUserBadges] = useState<Badge[]>([]);

  const fetchBadges = useCallback(async () => {
    if (!user) return;
    const { data: allBadges } = await supabase.rpc('get_active_badges');
    const { data: userBadgeRows } = await supabase.rpc('get_user_badges', { uid: user.id });
    setUserBadges(
      (allBadges || []).filter((b: Badge) =>
        (userBadgeRows || []).some((ub: { badge_id: string }) => ub.badge_id === b.id)
      )
    );
  }, [user]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges, profile]);

  if (!profile) return null;

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* @ts-ignore: badges props are injected for display */}
        <UserProfile profile={{ ...(profile as any), badges: userBadges, badgesCount: userBadges.length }} isOwnProfile={true} />
      </div>
    </div>
  );
}

