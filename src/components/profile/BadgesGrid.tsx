import { useEffect, useState, useRef } from "react";
import { ConfettiBurst } from "./ConfettiBurst";
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient';

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  color: string | null;
};

type BadgeProgress = {
  badge_id: string;
  progress: number;
  target: number | null;
};

export function BadgesGrid({ userId }: { userId: string }) {
  const [confetti, setConfetti] = useState(false);
  const prevUserBadges = useRef<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Badge progress state
  const [badgeProgress, setBadgeProgress] = useState<Record<string, BadgeProgress>>({});

  useEffect(() => {
    async function fetchBadges() {
      setLoading(true);
      const { data: allBadges } = await supabase.rpc("get_active_badges");
      const { data: userBadgeRows } = await supabase.rpc("get_user_badges", { uid: userId });
      const { data: progressRows } = await supabase.rpc("get_user_badge_progress", { uid: userId });
      setBadges(Array.isArray(allBadges) ? allBadges : []);
      const newUserBadges = new Set<string>((userBadgeRows || []).map((b: any) => String(b.badge_id)));
      const progressMap: Record<string, BadgeProgress> = {};
      (progressRows || []).forEach((row: any) => {
        progressMap[row.badge_id] = row;
      });
      setBadgeProgress(progressMap);
      if (prevUserBadges.current && newUserBadges.size > prevUserBadges.current.size) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 1800);
        const newBadgeIds = Array.from(newUserBadges).filter(id => !prevUserBadges.current.has(id));
        const newBadge = (allBadges || []).find((b: any) => b.id === newBadgeIds[0]);
        if (newBadge) {
          toast.success(
            <span style={{display:'flex',alignItems:'center',gap:10}}>
              {newBadge.icon_url && <img src={newBadge.icon_url} alt={newBadge.name} style={{width:32,height:32}} />}
              <span><b>Badge behaald!</b><br />{newBadge.name}</span>
            </span>,
            { duration: 3500, position: 'top-center' }
          );
        }
      }
      prevUserBadges.current = newUserBadges;
      setUserBadges(newUserBadges);
      setLoading(false);
    }
    if (userId) fetchBadges();
  }, [userId]);

  if (loading) return <div>Badges laden...</div>;
  if (!Array.isArray(badges)) return null;

  async function handleAwardBadge(badgeId: string) {
    await supabase.rpc('award_badge', { uid: userId, badge: badgeId });
    const { data: userBadgeRows } = await supabase.rpc('get_user_badges', { uid: userId });
    const newUserBadges = new Set<string>((userBadgeRows || []).map((b: any) => String(b.badge_id)));
    prevUserBadges.current = newUserBadges;
    setUserBadges(newUserBadges);
  }

  return (
    <div>
      <ConfettiBurst show={confetti} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 32,
          width: '100%',
          boxSizing: 'border-box',
          paddingLeft: 8,
          paddingRight: 8,
          marginTop: 32,
          marginBottom: 32,
        }}
      >
        {(showAll ? badges : badges.slice(0, 4)).map((badge) => {
          const progress = badgeProgress[badge.id];
          const hasProgress = progress && typeof progress.progress === 'number' && typeof progress.target === 'number' && progress.target !== null && progress.target > 0;
          const progressPercent = hasProgress && progress.target ? Math.min(100, (progress.progress / progress.target) * 100) : 0;
          return (
            <div
              key={badge.id}
              style={{
                border: userBadges.has(badge.id) ? `2px solid ${badge.color || '#4ade80'}` : '2px solid #ccc',
                borderRadius: 16,
                padding: 20,
                background: userBadges.has(badge.id) ? badge.color || '#e0ffe0' : '#f3f3f3',
                opacity: userBadges.has(badge.id) ? 1 : 0.5,
                minWidth: 0,
                minHeight: 180,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.07)',
                margin: '0 auto',
              }}
            >
              {badge.icon_url && (
                <img
                  src={badge.icon_url}
                  alt={badge.name}
                  style={{
                    width: 64,
                    height: 64,
                    marginBottom: 12,
                    filter: userBadges.has(badge.id) ? undefined : 'grayscale(1)',
                    opacity: userBadges.has(badge.id) ? 1 : 0.6,
                    transition: 'filter 0.3s, opacity 0.3s',
                  }}
                />
              )}
              <div style={{ fontWeight: 'bold' }}>{badge.name}</div>
              <div style={{ fontSize: 12 }}>{badge.description}</div>
              {hasProgress && (
                <div style={{ width: '100%', marginTop: 12 }}>
                  <div style={{ height: 8, background: '#e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ height: 8, background: '#4ade80', width: `${progressPercent}%`, borderRadius: 6, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{progress.progress} / {progress.target}</div>
                </div>
              )}
              {!userBadges.has(badge.id) && (
                <button
                  style={{ marginTop: 8, padding: '4px 12px', borderRadius: 6, background: '#4ade80', color: '#fff', border: 'none', cursor: 'pointer' }}
                  onClick={() => handleAwardBadge(badge.id)}
                >
                  Verdien badge
                </button>
              )}
            </div>
          );
        })}
      </div>
      {badges.length > 4 && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button
            style={{ padding: '6px 18px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? 'Show less' : 'Show more'}
          </button>
        </div>
      )}
    </div>
  );
}
