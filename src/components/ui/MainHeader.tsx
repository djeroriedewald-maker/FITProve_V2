import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Home,
  User,
  BarChart2,
  Layers,
  Users,
  UserPlus,
  X,
  Sparkles,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { NotificationDropdown } from './NotificationDropdown';
import AvatarDropdown from './AvatarDropdown';

export function MainHeader() {
  const { profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 22) return 'Good Evening';
    return 'Good Night';
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: '/', gradient: 'from-blue-500 to-cyan-500' },
    { icon: User, label: 'Profile', path: '/profile', gradient: 'from-cyan-500 to-blue-500' },
    { icon: BarChart2, label: 'Stats', path: '/stats', gradient: 'from-purple-500 to-pink-500' },
    { icon: Layers, label: 'Modules', path: '/modules', gradient: 'from-orange-500 to-red-500' },
    { icon: Users, label: 'Community', path: '/community', gradient: 'from-green-500 to-emerald-500' },
    { icon: UserPlus, label: 'Friends', path: '/friends', gradient: 'from-yellow-500 to-amber-500' },
  ];

  const bottomMenuItems = [
    { icon: Settings, label: 'Settings', path: '/settings', gradient: 'from-gray-500 to-slate-500' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Premium Glass Header */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-purple-500/20 blur-xl" />

        <div className="relative bg-black/40 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/20">
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="max-w-7xl mx-auto px-4 py-3.5">
            <div className="flex items-center justify-between">
              {/* Left: Logo + Profile */}
              <div className="flex items-center space-x-4">
                {/* Logo/Brand */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/')}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg blur opacity-50" />
                    <div className="relative bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                      FITProve
                    </h1>
                  </div>
                </motion.div>

                {/* Divider */}
                <div className="hidden md:block w-px h-8 bg-white/10" />

                {/* Profile Greeting */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="relative">
                    <AvatarDropdown />
                  </div>
                  <div>
                    <p className="text-white/50 text-xs font-medium">{getGreeting()}</p>
                    <h2 className="text-white font-semibold text-sm">
                      {profile?.full_name || profile?.username || 'Fitness Champion'}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-2">
                {/* Notification */}
                <div className="relative">
                  <NotificationDropdown />
                </div>

                {/* Menu Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="relative group p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur" />
                  <Menu className="relative w-6 h-6 text-white group-hover:text-orange-400 transition-colors" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Bottom gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </motion.div>

      {/* Premium Slide-in Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
            />

            {/* Menu Panel - Premium Glass Design */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 z-50"
            >
              {/* Glass background with gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-2xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-pink-500/5 to-purple-500/5" />

              {/* Left border gradient */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-orange-500/50 via-pink-500/50 to-purple-500/50" />

              <div className="relative h-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                      Menu
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-white/70" />
                    </motion.button>
                  </div>

                  {/* Mobile Profile (visible on small screens) */}
                  <div className="md:hidden flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <AvatarDropdown />
                    <div className="flex-1">
                      <p className="text-white/50 text-xs">{getGreeting()}</p>
                      <h2 className="text-white font-semibold text-sm truncate">
                        {profile?.full_name || profile?.username || 'Fitness Champion'}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto p-6 space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PremiumMenuItem
                        icon={item.icon}
                        label={item.label}
                        gradient={item.gradient}
                        isActive={location.pathname === item.path}
                        onClick={() => {
                          navigate(item.path);
                          setIsMenuOpen(false);
                        }}
                      />
                    </motion.div>
                  ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-6 border-t border-white/10 space-y-2">
                  {bottomMenuItems.map((item, index) => (
                    <PremiumMenuItem
                      key={item.path}
                      icon={item.icon}
                      label={item.label}
                      gradient={item.gradient}
                      isActive={location.pathname === item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMenuOpen(false);
                      }}
                    />
                  ))}
                </div>

                {/* Decorative gradient orb */}
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function PremiumMenuItem({
  label,
  onClick,
  icon: Icon,
  gradient,
  isActive
}: {
  label: string;
  onClick: () => void;
  icon?: React.ElementType;
  gradient: string;
  isActive: boolean;
}) {
  return (
    <motion.button
      whileHover={{ x: 4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        group relative w-full px-4 py-3.5 flex items-center space-x-3 rounded-xl
        transition-all duration-300 overflow-hidden
        ${isActive
          ? 'bg-white/10 text-white shadow-lg'
          : 'text-white/70 hover:text-white hover:bg-white/5'
        }
      `}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeMenuItem"
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b ${gradient} rounded-r-full`}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}

      {/* Hover gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-xl`} />

      {/* Icon with gradient on hover */}
      <div className="relative">
        {Icon && (
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-lg blur opacity-0 group-hover:opacity-50 transition-opacity`} />
            <Icon className={`relative w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
          </div>
        )}
      </div>

      {/* Label */}
      <span className="relative font-medium">{label}</span>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
    </motion.button>
  );
}
