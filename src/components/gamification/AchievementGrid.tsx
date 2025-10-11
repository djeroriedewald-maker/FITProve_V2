import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Lock,
  Award,
  Target,
  Zap,
  Users,
  Flame,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { GamificationService } from '../../services/gamification.service';
import { useAuth } from '../../contexts/AuthContext';
import type {
  AchievementProgress,
  AchievementCategory,
  AchievementTier,
} from '../../types/gamification.types';
import { GlassCard } from '../ui/GlassCard';

interface AchievementGridProps {
  showFilters?: boolean;
  columns?: number;
}

const CATEGORY_ICONS: Record<AchievementCategory, React.ReactNode> = {
  workout: <Target className="w-5 h-5" />,
  social: <Users className="w-5 h-5" />,
  consistency: <Flame className="w-5 h-5" />,
  pr: <Zap className="w-5 h-5" />,
  specialized: <Star className="w-5 h-5" />,
  creator: <Award className="w-5 h-5" />,
  challenge: <Trophy className="w-5 h-5" />,
};

const TIER_COLORS = {
  bronze: 'from-orange-700 to-orange-900',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-cyan-400 to-blue-600',
  legend: 'from-purple-500 to-pink-600',
};

const TIER_GLOW = {
  bronze: 'shadow-orange-500/25',
  silver: 'shadow-gray-400/25',
  gold: 'shadow-yellow-400/50',
  platinum: 'shadow-cyan-500/50',
  legend: 'shadow-purple-500/50',
};

export function AchievementGrid({ showFilters = true, columns = 3 }: AchievementGridProps) {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [selectedTier, setSelectedTier] = useState<AchievementTier | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'in-progress' | 'locked'>('all');

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await GamificationService.getUserAchievements(user.id);
      setAchievements(data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter achievements
  const filteredAchievements = achievements.filter((achievement) => {
    if (selectedCategory !== 'all' && achievement.achievement.category !== selectedCategory) {
      return false;
    }
    if (selectedTier !== 'all' && achievement.achievement.tier !== selectedTier) {
      return false;
    }
    if (selectedStatus === 'completed' && !achievement.is_completed) {
      return false;
    }
    if (selectedStatus === 'in-progress' && (achievement.is_completed || achievement.progress_current === 0)) {
      return false;
    }
    if (selectedStatus === 'locked' && (achievement.is_completed || achievement.progress_current > 0)) {
      return false;
    }
    return true;
  });

  // Calculate stats
  const completedCount = achievements.filter((a) => a.is_completed).length;
  const inProgressCount = achievements.filter((a) => !a.is_completed && a.progress_current > 0).length;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3" />
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
            {[...Array(6)].map((_, i) => (
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
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Achievements</h2>
            <p className="text-sm text-white/60">Unlock badges and earn rewards</p>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{completedCount}</div>
              <div className="text-xs text-white/60">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{inProgressCount}</div>
              <div className="text-xs text-white/60">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white/60">{totalCount}</div>
              <div className="text-xs text-white/60">Total</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-3">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
              >
                All Categories
              </FilterButton>
              {Object.keys(CATEGORY_ICONS).map((cat) => (
                <FilterButton
                  key={cat}
                  active={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat as AchievementCategory)}
                >
                  {CATEGORY_ICONS[cat as AchievementCategory]}
                  <span className="ml-1 capitalize">{cat}</span>
                </FilterButton>
              ))}
            </div>

            {/* Tier & Status Filters */}
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={selectedStatus === 'all'}
                onClick={() => setSelectedStatus('all')}
              >
                All Status
              </FilterButton>
              <FilterButton
                active={selectedStatus === 'completed'}
                onClick={() => setSelectedStatus('completed')}
              >
                ✅ Completed
              </FilterButton>
              <FilterButton
                active={selectedStatus === 'in-progress'}
                onClick={() => setSelectedStatus('in-progress')}
              >
                ⏳ In Progress
              </FilterButton>
              <FilterButton
                active={selectedStatus === 'locked'}
                onClick={() => setSelectedStatus('locked')}
              >
                🔒 Locked
              </FilterButton>
            </div>
          </div>
        )}
      </div>

      {/* Achievement Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
        <AnimatePresence mode="popLayout">
          {filteredAchievements.map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No achievements found with current filters</p>
        </div>
      )}
    </GlassCard>
  );
}

// Achievement Card Component
interface AchievementCardProps {
  achievement: AchievementProgress;
  index: number;
}

function AchievementCard({ achievement, index }: AchievementCardProps) {
  const { achievement: def, is_completed, progress_current, progress_total, percentage } = achievement;
  const isLocked = progress_current === 0 && !is_completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-4 border transition-all ${
        is_completed
          ? `border-${def.tier === 'legend' ? 'purple' : 'green'}-500/50 shadow-lg ${TIER_GLOW[def.tier]}`
          : 'border-white/20 hover:border-white/40'
      } ${isLocked ? 'opacity-60' : ''}`}
    >
      {/* Tier Badge */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${TIER_COLORS[def.tier]}`}>
        {def.tier}
      </div>

      {/* Icon */}
      <div className="mb-4">
        <motion.div
          className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
            is_completed
              ? `bg-gradient-to-br ${TIER_COLORS[def.tier]} shadow-lg ${TIER_GLOW[def.tier]}`
              : 'bg-white/10'
          }`}
          animate={is_completed ? { rotate: [0, 360] } : {}}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          {isLocked ? (
            <Lock className="w-8 h-8 text-white/40" />
          ) : is_completed ? (
            <CheckCircle2 className="w-8 h-8 text-white" />
          ) : (
            CATEGORY_ICONS[def.category]
          )}

          {is_completed && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </motion.div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <h3 className="text-lg font-bold text-white mb-1">{def.name}</h3>
        <p className="text-sm text-white/60 line-clamp-2">{def.description}</p>
      </div>

      {/* Progress Bar */}
      {!is_completed && !isLocked && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/60">Progress</span>
            <span className="text-xs font-semibold text-white">
              {progress_current}/{progress_total}
            </span>
          </div>
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Rewards */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {def.xp_reward > 0 && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Zap className="w-3 h-3" />
              <span>{def.xp_reward} XP</span>
            </div>
          )}
          {def.coin_reward > 0 && (
            <div className="flex items-center gap-1 text-orange-400">
              <span>🪙</span>
              <span>{def.coin_reward}</span>
            </div>
          )}
        </div>

        {is_completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </motion.div>
        )}
      </div>

      {/* Completed Overlay */}
      {is_completed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-xl pointer-events-none"
        />
      )}
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
