import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MessageCircle, Users, UserPlus, Heart, Zap } from 'lucide-react';
import { FollowingList } from '../components/profile/FollowingList';
import { UserSearchModal } from '../components/profile/UserSearchModal';
import { DirectMessageModal } from '../components/profile/DirectMessageModal';
import { ConversationList } from '../components/profile/ConversationList';
import { GlassCard, GlassButton } from '../components/ui/GlassCard';
import { StatsCard } from '../components/ui/WorkoutCard';
import { ProgressiveImage } from '../components/ui/ProgressiveImage';

const FriendsPage = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  // Handler to close chat and return to inbox
  const handleBackToInbox = () => setSelectedUser(null);
  // Handler to close everything and return to Friends page
  const handleCloseAll = () => {
    setShowInbox(false);
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen space-y-8">
      {/* Hero Section with Glass Morphism */}
      <section className="relative -mx-4 -mt-4">
        <div className="relative w-full h-[50vh] sm:h-[60vh] overflow-hidden rounded-3xl">
          <ProgressiveImage
            src="/images/friendszone.webp"
            alt="FriendsZone Hero"
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
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  FriendsZone
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-2xl mx-auto">
                Connect with workout buddies, share achievements, and motivate each other on your
                fitness journey
              </p>

              <div className="flex items-center justify-center gap-8">
                <div className="flex items-center gap-2 text-primary">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">Find Friends</span>
                </div>
                <div className="flex items-center gap-2 text-secondary">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Chat & Support</span>
                </div>
                <div className="flex items-center gap-2 text-accent">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">Motivate Together</span>
                </div>
              </div>
            </motion.div>
          </GlassCard>
        </div>
      </section>

      {/* Quick Stats */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatsCard
            title="Friends"
            value="12"
            icon={<Users className="w-6 h-6" />}
            trend="up"
            trendValue="+3"
            glowColor="cyan"
          />
          <StatsCard
            title="Messages"
            value="47"
            icon={<MessageCircle className="w-6 h-6" />}
            trend="up"
            trendValue="+8"
            glowColor="purple"
          />
          <StatsCard
            title="Connections"
            value="156"
            icon={<UserPlus className="w-6 h-6" />}
            glowColor="orange"
          />
          <StatsCard
            title="Support Given"
            value="89"
            icon={<Heart className="w-6 h-6" />}
            trend="up"
            trendValue="+15"
            glowColor="green"
          />
        </motion.div>
      </section>

      {/* Action Buttons */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <GlassButton size="lg" onClick={() => setShowSearch(true)} glowColor="primary">
            <Search className="w-5 h-5 mr-2" />
            Search Friends
          </GlassButton>

          <GlassButton variant="secondary" size="lg" onClick={() => setShowInbox(true)}>
            <MessageCircle className="w-5 h-5 mr-2" />
            Inbox
          </GlassButton>
        </motion.div>
      </section>

      {/* Friends List Section */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <GlassCard variant="workout" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Your Fitness Network</h2>
                <p className="text-white/70">Stay connected with your workout community</p>
              </div>
              <Zap className="w-8 h-8 text-accent" />
            </div>

            <FollowingList />
          </GlassCard>
        </motion.div>
      </section>
      {/* Inbox Modal */}
      {showInbox && !selectedUser && (
        <div className="fixed z-50 inset-0 flex flex-col bg-black bg-opacity-60">
          <div className="flex flex-col w-full h-full bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-primary to-purple-600">
              <button
                onClick={() => setShowInbox(false)}
                className="text-white text-2xl font-bold opacity-80 hover:opacity-100 focus:outline-none"
                aria-label="Close inbox"
              >
                ←
              </button>
              <span className="text-xl font-extrabold text-white tracking-wide">Inbox</span>
              <button
                onClick={handleCloseAll}
                className="text-white text-2xl font-bold opacity-80 hover:opacity-100 focus:outline-none"
                aria-label="Close all"
                style={{ marginLeft: 8 }}
              >
                ×
              </button>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              <ConversationList
                onSelect={(user) => setSelectedUser(user)}
                selectedUserId={undefined}
              />
            </div>
          </div>
        </div>
      )}
      {showInbox && selectedUser && (
        <div className="fixed z-50 inset-0 flex flex-col bg-black bg-opacity-60">
          <div className="flex flex-col w-full h-full bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-primary to-purple-600">
              <button
                onClick={handleBackToInbox}
                className="text-white text-2xl font-bold opacity-80 hover:opacity-100 focus:outline-none"
                aria-label="Back to inbox"
              >
                ←
              </button>
              <span className="text-xl font-extrabold text-white tracking-wide">Chat</span>
              <button
                onClick={handleCloseAll}
                className="text-white text-2xl font-bold opacity-80 hover:opacity-100 focus:outline-none"
                aria-label="Close all"
                style={{ marginLeft: 8 }}
              >
                ×
              </button>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              <DirectMessageModal
                isOpen={true}
                onClose={handleBackToInbox}
                recipientId={selectedUser.id}
                recipientName={selectedUser.displayName || selectedUser.username}
                recipientAvatarUrl={selectedUser.avatarUrl}
              />
            </div>
          </div>
        </div>
      )}

      {/* Friends List */}
      <section>
        <div className="mb-8">
          <FollowingList />
        </div>
      </section>

      {/* Search Modal */}
      <UserSearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </div>
  );
};

export default FriendsPage;
