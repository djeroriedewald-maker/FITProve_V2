import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Trophy,
  Heart,
  MessageCircle,
  TrendingUp,
  Star,
  Zap,
  Target,
  Award,
  Flame,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Gamification Components
import {
  XPProgressBar,
  LiveActivityCounter,
  Leaderboard,
  AchievementGrid,
  AchievementUnlockModal,
  ChallengeBrowser,
  StreakDisplay,
} from '../components/gamification';

// Existing Components
import { CommunityHighlights } from '../components/ui/CommunityHighlights';
import { CommunityWorkoutsPromoCard } from '../components/community/CommunityWorkoutsPromoCard';
import { CommunityChallengePromoCard } from '../components/community/CommunityChallengePromoCard';
import { CommunityNetworkPromoCard } from '../components/community/CommunityNetworkPromoCard';
import { GlassCard, GlassButton } from '../components/ui/GlassCard';
import { ProgressiveImage } from '../components/ui/ProgressiveImage';

import type { AchievementProgress } from '../types/gamification.types';

export function CommunityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'leaderboards' | 'achievements' | 'challenges'>('overview');
  const [unlockedAchievement, setUnlockedAchievement] = useState<AchievementProgress | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const handleLevelUp = (newLevel: number) => {
    // You can show a custom notification here
    console.log('Level up!', newLevel);
  };

  return (
    <div className="min-h-screen space-y-8 pb-20">
      {/* Hero Section with Live Stats */}
      <section className="relative -mx-4 -mt-4">
        <div className="relative w-full h-[40vh] overflow-hidden rounded-3xl">
          <ProgressiveImage
            src="/images/community.webp"
            alt="Community Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                FitProve Community
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Compete, connect, and conquer together 🔥
            </p>
          </motion.div>

          {/* Live Activity - Ticker Style */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-3xl"
          >
            <LiveActivityCounter variant="ticker" />
          </motion.div>
        </div>
      </section>

      {/* User Progress Section */}
      {user && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* XP Progress */}
            <div className="lg:col-span-2">
              <XPProgressBar variant="full" showDetails onLevelUp={handleLevelUp} />
            </div>

            {/* Streak */}
            <div>
              <StreakDisplay variant="compact" showLongest />
            </div>
          </div>
        </motion.section>
      )}

      {/* Navigation Tabs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          <TabButton
            active={selectedTab === 'overview'}
            onClick={() => setSelectedTab('overview')}
            icon={<Target className="w-5 h-5" />}
          >
            Overview
          </TabButton>
          <TabButton
            active={selectedTab === 'leaderboards'}
            onClick={() => setSelectedTab('leaderboards')}
            icon={<Trophy className="w-5 h-5" />}
          >
            Leaderboards
          </TabButton>
          <TabButton
            active={selectedTab === 'achievements'}
            onClick={() => setSelectedTab('achievements')}
            icon={<Award className="w-5 h-5" />}
          >
            Achievements
          </TabButton>
          <TabButton
            active={selectedTab === 'challenges'}
            onClick={() => setSelectedTab('challenges')}
            icon={<Flame className="w-5 h-5" />}
          >
            Challenges
          </TabButton>
        </div>
      </motion.section>

      {/* Tab Content */}
      <motion.div
        key={selectedTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {selectedTab === 'overview' && <OverviewTab />}
        {selectedTab === 'leaderboards' && <LeaderboardsTab />}
        {selectedTab === 'achievements' && <AchievementsTab />}
        {selectedTab === 'challenges' && <ChallengesTab />}
      </motion.div>

      {/* Achievement Unlock Modal */}
      <AchievementUnlockModal
        achievement={unlockedAchievement}
        isOpen={showAchievementModal}
        onClose={() => {
          setShowAchievementModal(false);
          setUnlockedAchievement(null);
        }}
      />
    </div>
  );
}

// Tab Button Component
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function TabButton({ active, onClick, icon, children }: TabButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
        active
          ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25'
          : 'bg-white/10 text-white/60 hover:bg-white/20'
      }`}
    >
      {icon}
      <span>{children}</span>
    </motion.button>
  );
}

// Overview Tab
function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Live Activity (Full Version) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <LiveActivityCounter variant="full" showAllStats refreshInterval={10000} />
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <CommunityHighlights />
      </motion.section>

      {/* Feature Cards */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -4, scale: 1.02 }}>
            <CommunityWorkoutsPromoCard />
          </motion.div>

          <motion.div whileHover={{ y: -4, scale: 1.02 }}>
            <CommunityChallengePromoCard />
          </motion.div>

          <motion.div whileHover={{ y: -4, scale: 1.02 }}>
            <CommunityNetworkPromoCard />
          </motion.div>
        </div>
      </motion.section>

      {/* Quick Leaderboard Preview */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Leaderboard type="weekly_workouts" limit={10} showFilters={false} />
      </motion.section>
    </div>
  );
}

// Leaderboards Tab
function LeaderboardsTab() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Leaderboard type="weekly_workouts" limit={50} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Leaderboard type="xp" limit={50} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Leaderboard type="streak" limit={50} />
      </motion.div>
    </div>
  );
}

// Achievements Tab
function AchievementsTab() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <AchievementGrid showFilters columns={3} />
      </motion.div>
    </div>
  );
}

// Challenges Tab
function ChallengesTab() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ChallengeBrowser showFilters />
      </motion.div>
    </div>
  );
}
