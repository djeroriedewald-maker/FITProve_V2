import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Users,
  Zap,
  Flame,
  Crown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { GamificationService } from '../../services/gamification.service';
import { useAuth } from '../../contexts/AuthContext';
import type { LeaderboardEntry, LeaderboardType, LeaderboardFilters } from '../../types/gamification.types';
import { GlassCard } from '../ui/GlassCard';

interface LeaderboardProps {
  type: LeaderboardType;
  limit?: number;
  showFilters?: boolean;
  highlightCurrentUser?: boolean;
}

const LEADERBOARD_CONFIGS = {
  weekly_workouts: {
    title: 'Weekly Workouts',
    icon: <Dumbbell className="w-5 h-5" />,
    color: 'from-cyan-500 to-blue-500',
    description: 'Most workouts completed this week',
  },
  monthly_volume: {
    title: 'Monthly Volume',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
    description: 'Highest volume this month',
  },
  streak: {
    title: 'Streak Champions',
    icon: <Flame className="w-5 h-5" />,
    color: 'from-orange-500 to-red-500',
    description: 'Longest current streaks',
  },
  xp: {
    title: 'XP Leaders',
    icon: <Zap className="w-5 h-5" />,
    color: 'from-yellow-500 to-orange-500',
    description: 'Highest total XP',
  },
  challenge_wins: {
    title: 'Challenge Champions',
    icon: <Trophy className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-500',
    description: 'Most challenge wins',
  },
};

function Dumbbell({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.4 14.4 9.6 9.6" />
      <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
      <path d="m21.5 21.5-1.4-1.4" />
      <path d="M3.9 3.9 2.5 2.5" />
      <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z" />
    </svg>
  );
}

export function Leaderboard({
  type,
  limit = 100,
  showFilters = true,
  highlightCurrentUser = true,
}: LeaderboardProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<'global' | 'friends' | 'local'>('global');
  const [userPosition, setUserPosition] = useState<LeaderboardEntry | null>(null);

  const config = LEADERBOARD_CONFIGS[type];

  useEffect(() => {
    fetchLeaderboard();
  }, [type, scope]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const filters: LeaderboardFilters = { type, scope };
      const data = await GamificationService.getLeaderboard(filters, limit);

      // Mark current user
      const updatedData = data.map((entry) => ({
        ...entry,
        is_current_user: user ? entry.user_id === user.id : false,
      }));

      setEntries(updatedData);

      // Find user's position
      if (user) {
        const userEntry = updatedData.find((e) => e.user_id === user.id);
        setUserPosition(userEntry || null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1)
      return <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />;
    if (rank === 2)
      return <Medal className="w-6 h-6 text-gray-300 fill-gray-300" />;
    if (rank === 3)
      return <Medal className="w-6 h-6 text-orange-400 fill-orange-400" />;
    return <span className="text-lg font-bold text-white/60">#{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50';
    if (rank === 2)
      return 'bg-gradient-to-br from-gray-300 to-gray-400 shadow-lg shadow-gray-400/50';
    if (rank === 3)
      return 'bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-500/50';
    return 'bg-white/10';
  };

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white/10 rounded-xl" />
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className={`p-3 rounded-xl bg-gradient-to-br ${config.color}`}
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              {config.icon}
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">{config.title}</h2>
              <p className="text-sm text-white/60">{config.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-white/60">{entries.length} competitors</span>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex gap-2">
            {(['global', 'friends', 'local'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  scope === s
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {s === 'global' && '🌍 Global'}
                {s === 'friends' && '👥 Friends'}
                {s === 'local' && '📍 Local'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Position (if not in top) */}
      {highlightCurrentUser && userPosition && userPosition.rank && userPosition.rank > limit && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-xl border border-cyan-500/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm text-white/60">Your Position</div>
              <div className="text-xl font-bold text-cyan-400">#{userPosition.rank}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{userPosition.score}</div>
              <div className="text-xs text-white/60">points</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="mb-6 flex items-end justify-center gap-4">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1"
          >
            <LeaderboardPodium entry={entries[1]} rank={2} />
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="flex-1"
          >
            <LeaderboardPodium entry={entries[0]} rank={1} />
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <LeaderboardPodium entry={entries[2]} rank={3} />
          </motion.div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {entries.slice(3).map((entry, index) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              rank={index + 4}
              isCurrentUser={entry.is_current_user}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {entries.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No entries yet. Be the first!</p>
        </div>
      )}
    </GlassCard>
  );
}

// Podium Component
interface LeaderboardPodiumProps {
  entry: LeaderboardEntry;
  rank: number;
}

function LeaderboardPodium({ entry, rank }: LeaderboardPodiumProps) {
  const heights = { 1: 'h-32', 2: 'h-24', 3: 'h-20' };
  const colors = {
    1: 'from-yellow-400 to-orange-500',
    2: 'from-gray-300 to-gray-400',
    3: 'from-orange-400 to-red-500',
  };

  return (
    <div className="text-center">
      {/* Avatar */}
      <motion.div
        className="relative w-16 h-16 mx-auto mb-2"
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        {entry.user?.avatar_url ? (
          <img
            src={entry.user.avatar_url}
            alt={entry.user.display_name}
            className="w-full h-full rounded-full object-cover border-2 border-white/20"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {entry.user?.display_name?.charAt(0) || '?'}
            </span>
          </div>
        )}

        {/* Crown for 1st */}
        {rank === 1 && (
          <motion.div
            className="absolute -top-4 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </motion.div>
        )}

        {/* Rank Badge */}
        <div
          className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${
            colors[rank as keyof typeof colors]
          }`}
        >
          {rank}
        </div>
      </motion.div>

      {/* Name */}
      <div className="font-semibold text-white text-sm mb-1 truncate">
        {entry.user?.display_name || 'Unknown'}
      </div>

      {/* Score */}
      <div className="text-2xl font-bold text-white mb-2">{entry.score}</div>

      {/* Podium Base */}
      <motion.div
        className={`${heights[rank as keyof typeof heights]} bg-gradient-to-br ${
          colors[rank as keyof typeof colors]
        } rounded-t-xl flex items-center justify-center`}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, delay: rank * 0.1 }}
        style={{ transformOrigin: 'bottom' }}
      >
        <span className="text-4xl font-bold text-white/80">{rank}</span>
      </motion.div>
    </div>
  );
}

// Row Component
interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser?: boolean;
  index: number;
}

function LeaderboardRow({ entry, rank, isCurrentUser, index }: LeaderboardRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
        isCurrentUser
          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
          : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      {/* Rank */}
      <div className="w-12 flex items-center justify-center">
        {rank <= 3 ? (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              rank === 1
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                : rank === 2
                ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                : 'bg-gradient-to-br from-orange-400 to-red-500'
            }`}
          >
            <span className="text-white font-bold">{rank}</span>
          </div>
        ) : (
          <span className="text-lg font-bold text-white/60">#{rank}</span>
        )}
      </div>

      {/* Avatar */}
      <div className="relative w-12 h-12 flex-shrink-0">
        {entry.user?.avatar_url ? (
          <img
            src={entry.user.avatar_url}
            alt={entry.user.display_name}
            className="w-full h-full rounded-full object-cover border-2 border-white/20"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold">
              {entry.user?.display_name?.charAt(0) || '?'}
            </span>
          </div>
        )}

        {/* Level Badge */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
          {entry.user?.current_level || 1}
        </div>
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white truncate">
          {entry.user?.display_name || 'Unknown'}
          {isCurrentUser && (
            <span className="ml-2 px-2 py-0.5 bg-cyan-500/20 rounded text-xs text-cyan-400">
              You
            </span>
          )}
        </div>
        <div className="text-xs text-white/60">@{entry.user?.username || 'unknown'}</div>
      </div>

      {/* Score */}
      <div className="text-right">
        <div className="text-2xl font-bold text-white">{entry.score}</div>
        {entry.change !== undefined && entry.change !== 0 && (
          <div
            className={`flex items-center gap-1 text-xs ${
              entry.change > 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {entry.change > 0 ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            <span>{Math.abs(entry.change)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
