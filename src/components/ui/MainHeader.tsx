import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Home, BarChart2, Layers, Users, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { NotificationDropdown } from './NotificationDropdown';
import AvatarDropdown from './AvatarDropdown';

export function MainHeader() {
  const { profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 22) return 'Good Evening';
    return 'Good Night';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/10"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left side: Profile and Greeting */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <AvatarDropdown />
              </div>
              <div>
                <p className="text-white/70 text-sm">{getGreeting()}</p>
                <h2 className="text-white font-semibold">
                  {profile?.full_name || profile?.username || 'Fitness Champion'}
                </h2>
              </div>
            </div>

            {/* Right side: Notifications and Menu */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <NotificationDropdown />
              </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Menu - Slides in from right */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-72 bg-gradient-to-b from-gray-900 to-black border-l border-white/10 shadow-2xl z-50"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-6">Menu</h3>
                <nav className="space-y-4">
                  <MenuItem
                    icon={Home}
                    label="Home"
                    onClick={() => {
                      navigate('/');
                      setIsMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={BarChart2}
                    label="Stats"
                    onClick={() => {
                      navigate('/stats');
                      setIsMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={Layers}
                    label="Modules"
                    onClick={() => {
                      navigate('/modules');
                      setIsMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={Users}
                    label="Community"
                    onClick={() => {
                      navigate('/community');
                      setIsMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={UserPlus}
                    label="Friends"
                    onClick={() => {
                      navigate('/friends');
                      setIsMenuOpen(false);
                    }}
                  />
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function MenuItem({ label, onClick, icon: Icon }: { label: string; onClick: () => void; icon?: React.ElementType }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 flex items-center space-x-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{label}</span>
    </button>
  );
}