
import { motion } from 'framer-motion';
import { Users, Trophy, Heart, MessageCircle, TrendingUp, Star } from 'lucide-react';
import { SocialFeed } from '../components/social';
import { CommunityHighlights } from '../components/ui/CommunityHighlights';
import { CommunityWorkoutsPromoCard } from '../components/community/CommunityWorkoutsPromoCard';
import { CommunityChallengePromoCard } from '../components/community/CommunityChallengePromoCard';
import { CommunityNetworkPromoCard } from '../components/community/CommunityNetworkPromoCard';
import { GlassCard, GlassButton } from '../components/ui/GlassCard';
import { StatsCard } from '../components/ui/WorkoutCard';
import { ProgressiveImage } from '../components/ui/ProgressiveImage';
import { useEffect } from 'react';

export function CommunityPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="min-h-screen space-y-8">
      {/* Hero Section with Glass Morphism */}
      <section className="relative -mx-4 -mt-4">
        <div className="relative w-full h-[50vh] sm:h-[60vh] overflow-hidden rounded-3xl">
          <ProgressiveImage
            src="/images/community.webp"
            alt="Community Hero"
            className="w-full h-full object-cover"
          />
          {/* Glass morphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center p-6">
          <GlassCard variant="hero" className="max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Community
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-2xl mx-auto">
                Connect with other fitness enthusiasts and share your journey. Together we're stronger!
              </p>

              <div className="flex items-center justify-center gap-8">
                <div className="flex items-center gap-2 text-primary">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">2.5k+ Members</span>
                </div>
                <div className="flex items-center gap-2 text-secondary">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">Active Community</span>
                </div>
                <div className="flex items-center gap-2 text-accent">
                  <Trophy className="w-5 h-5" />
                  <span className="text-sm font-medium">Weekly Challenges</span>
                </div>
              </div>
            </motion.div>
          </GlassCard>
        </div>
      </section>

      {/* Community Stats */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatsCard
            title="Members"
            value="2.5k+"
            icon={<Users className="w-6 h-6" />}
            trend="up"
            trendValue="+25%"
            glowColor="cyan"
          />
          <StatsCard
            title="Posts Today"
            value="47"
            icon={<MessageCircle className="w-6 h-6" />}
            trend="up"
            trendValue="+12"
            glowColor="purple"
          />
          <StatsCard
            title="Active Challenges"
            value="8"
            icon={<Trophy className="w-6 h-6" />}
            glowColor="orange"
          />
          <StatsCard
            title="Success Rate"
            value="94%"
            icon={<TrendingUp className="w-6 h-6" />}
            trend="up"
            trendValue="+3%"
            glowColor="green"
          />
        </motion.div>
      </section>

      {/* Enhanced Community Features */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6"
        >
          <CommunityHighlights />
          
          {/* Feature Cards Grid */}
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
        </motion.div>
      </section>

      {/* Social Feed Section */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <GlassCard variant="workout" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Community Feed</h2>
                <p className="text-white/70">Latest updates from our amazing community</p>
              </div>
              <Star className="w-8 h-8 text-accent" />
            </div>
            
            {/* Placeholder for social feed - would render actual SocialFeed component */}
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <p className="text-white/70 mb-6">Social feed coming soon!</p>
              <GlassButton variant="secondary">
                Join the Conversation
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      </section>
    </div>
  );
}

