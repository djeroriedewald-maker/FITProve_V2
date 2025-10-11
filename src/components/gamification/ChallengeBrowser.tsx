import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Users,
  Clock,
  Target,
  Flame,
  Dumbbell,
  Calendar,
  ArrowRight,
  Award,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { GamificationService } from '../../services/gamification.service';
import { useAuth } from '../../contexts/AuthContext';
import type {
  CommunityChallenge,
  ChallengeStatus,
  ChallengeCategory,
} from '../../types/gamification.types';
import { GlassCard, GlassButton } from '../ui/GlassCard';

interface ChallengeBrowserProps {
  onChallengeClick?: (challenge: CommunityChallenge) => void;
  showFilters?: boolean;
}

const CATEGORY_CONFIG = {
  endurance: {
    icon: <Flame className="w-5 h-5" />,
    color: 'from-red-500 to-orange-500',
    label: 'Endurance',
  },
  strength: {
    icon: <Dumbbell className="w-5 h-5" />,
    color: 'from-cyan-500 to-blue-500',
    label: 'Strength',
  },
  volume: {
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
    label: 'Volume',
  },
  consistency: {
    icon: <Calendar className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-500',
    label: 'Consistency',
  },
  specialized: {
    icon: <Award className="w-5 h-5" />,
    color: 'from-yellow-500 to-orange-500',
    label: 'Specialized',
  },
};

const STATUS_LABELS = {
  upcoming: '⏰ Upcoming',
  active: '🔥 Active',
  completed: '✅ Completed',
  cancelled: '❌ Cancelled',
};

export function ChallengeBrowser({ onChallengeClick, showFilters = true }: ChallengeBrowserProps) {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<ChallengeStatus | 'all'>('active');
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | 'all'>('all');

  useEffect(() => {
    fetchChallenges();
  }, [selectedStatus, selectedCategory]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const filters = {
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
      };

      const data = await GamificationService.getChallenges(filters);
      setChallenges(data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-white/10 rounded-xl" />
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Community Challenges</h2>
              <p className="text-sm text-white/60">Join challenges and compete with others</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-orange-400">{challenges.length}</div>
            <div className="text-xs text-white/60">Challenges</div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-3">
            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={selectedStatus === 'all'}
                onClick={() => setSelectedStatus('all')}
              >
                All Status
              </FilterButton>
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <FilterButton
                  key={status}
                  active={selectedStatus === status}
                  onClick={() => setSelectedStatus(status as ChallengeStatus)}
                >
                  {label}
                </FilterButton>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
              >
                All Categories
              </FilterButton>
              {Object.entries(CATEGORY_CONFIG).map(([cat, config]) => (
                <FilterButton
                  key={cat}
                  active={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat as ChallengeCategory)}
                >
                  {config.icon}
                  <span className="ml-1">{config.label}</span>
                </FilterButton>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Challenge Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {challenges.map((challenge, index) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              index={index}
              onClick={() => onChallengeClick?.(challenge)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {challenges.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No challenges found with current filters</p>
        </div>
      )}
    </GlassCard>
  );
}

// Challenge Card Component
interface ChallengeCardProps {
  challenge: CommunityChallenge;
  index: number;
  onClick: () => void;
}

function ChallengeCard({ challenge, index, onClick }: ChallengeCardProps) {
  const categoryConfig = CATEGORY_CONFIG[challenge.category];
  const daysUntilEnd = Math.ceil(
    (new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isActive = challenge.status === 'active';
  const isUpcoming = challenge.status === 'upcoming';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div
        className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
          isActive
            ? 'border-orange-500/50 shadow-lg shadow-orange-500/20'
            : 'border-white/20 hover:border-white/40'
        }`}
      >
        {/* Featured Badge */}
        {challenge.is_featured && (
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-xs font-bold text-black flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Featured
            </div>
          </div>
        )}

        {/* Category Icon */}
        <div className="mb-4">
          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${categoryConfig.color}`}>
            {categoryConfig.icon}
          </div>
        </div>

        {/* Title & Description */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
          <p className="text-sm text-white/60 line-clamp-2">{challenge.description}</p>
        </div>

        {/* Challenge Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Participants */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
              <Users className="w-3 h-3" />
              <span>Participants</span>
            </div>
            <div className="text-lg font-bold text-white">
              {challenge.participant_count}
              {challenge.max_participants && ` / ${challenge.max_participants}`}
            </div>
          </div>

          {/* Time Remaining */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
              <Clock className="w-3 h-3" />
              <span>Time Left</span>
            </div>
            <div className="text-lg font-bold text-white">
              {isActive
                ? `${daysUntilEnd}d`
                : isUpcoming
                ? 'Soon'
                : 'Ended'}
            </div>
          </div>

          {/* Goal */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
              <Target className="w-3 h-3" />
              <span>Goal</span>
            </div>
            <div className="text-sm font-bold text-white">
              {challenge.goal_value} {challenge.goal_unit}
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
              <Zap className="w-3 h-3" />
              <span>Difficulty</span>
            </div>
            <div
              className={`text-sm font-bold capitalize ${
                challenge.difficulty_level === 'extreme'
                  ? 'text-red-400'
                  : challenge.difficulty_level === 'hard'
                  ? 'text-orange-400'
                  : challenge.difficulty_level === 'medium'
                  ? 'text-yellow-400'
                  : 'text-green-400'
              }`}
            >
              {challenge.difficulty_level}
            </div>
          </div>
        </div>

        {/* Rewards */}
        {(challenge.xp_reward > 0 || challenge.coin_reward > 0 || challenge.prize_pool > 0) && (
          <div className="mb-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
            <div className="text-xs text-white/60 mb-2">Rewards</div>
            <div className="flex items-center gap-4 text-sm">
              {challenge.xp_reward > 0 && (
                <div className="flex items-center gap-1 text-yellow-400">
                  <Zap className="w-4 h-4" />
                  <span className="font-bold">{challenge.xp_reward} XP</span>
                </div>
              )}
              {challenge.coin_reward > 0 && (
                <div className="flex items-center gap-1 text-orange-400">
                  <span>🪙</span>
                  <span className="font-bold">{challenge.coin_reward}</span>
                </div>
              )}
              {challenge.prize_pool > 0 && (
                <div className="flex items-center gap-1 text-green-400">
                  <span>💰</span>
                  <span className="font-bold">${challenge.prize_pool}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status & Action */}
        <div className="flex items-center justify-between">
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? 'bg-orange-500/20 text-orange-400'
                : isUpcoming
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-white/10 text-white/60'
            }`}
          >
            {STATUS_LABELS[challenge.status]}
          </div>

          <GlassButton variant="secondary" size="sm">
            View Details
            <ArrowRight className="w-4 h-4 ml-1" />
          </GlassButton>
        </div>

        {/* Sponsored Badge */}
        {challenge.sponsored_by && (
          <div className="mt-3 text-xs text-white/40 text-center">
            Sponsored by {challenge.sponsored_by}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Filter Button Component
interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function FilterButton({ active, onClick, children }: FilterButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all ${
        active
          ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
          : 'bg-white/10 text-white/60 hover:bg-white/20'
      }`}
    >
      {children}
    </motion.button>
  );
}
