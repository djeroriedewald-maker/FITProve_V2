import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  User, 
  Settings, 
  LogOut, 
  Dumbbell, 
  CalendarDays, 
  ChevronDown 
} from 'lucide-react';
import { AdminPanelMenuItem } from './AdminPanelMenuItem2';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if click is outside the button and dropdown
      if (buttonRef.current && !buttonRef.current.contains(target)) {
        // Also check if the click is not inside any dropdown element
        const dropdownElement = document.querySelector('[data-profile-dropdown]');
        if (!dropdownElement || !dropdownElement.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const calculatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const dropdownWidth = 256;
      const dropdownHeight = 350;

      let top = rect.bottom + 8;
      let left = rect.left;

      // Keep dropdown on screen horizontally
      if (left + dropdownWidth > viewportWidth - 16) {
        left = viewportWidth - dropdownWidth - 16;
      }
      if (left < 16) {
        left = 16;
      }

      // Keep dropdown on screen vertically
      if (top + dropdownHeight > viewportHeight - 16) {
        top = rect.top - dropdownHeight - 8;
      }
      if (top < 16) {
        top = 16;
      }

      setDropdownPosition({ top, left });
    }
  };

  const handleClick = () => {
    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Logged out successfully');
      setIsOpen(false);
      navigate('/signin');
    } catch (error: any) {
      toast.error('Error logging out: ' + error.message);
    }
  };

  const handleSignIn = () => {
    navigate('/signin');
  };

  const goToProfile = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  const goToMyWorkouts = () => {
    navigate('/modules/workout/my-workouts');
    setIsOpen(false);
  };

  const goToMyPlanner = () => {
    navigate('/modules/workout/planner');
    setIsOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <motion.button
        onClick={handleSignIn}
        className="flex items-center space-x-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:from-primary/80 hover:to-secondary/80 transition-all shadow-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <User className="w-4 h-4" />
        <span>Sign in</span>
      </motion.button>
    );
  }

  return (
    <>
      <motion.button
        ref={buttonRef}
        onClick={handleClick}
        className="flex items-center gap-2 focus:outline-none group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px]">
          <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name || profile.username || 'User'}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-white font-semibold text-sm">
                {profile?.name
                  ? getInitials(profile.name)
                  : profile?.username
                    ? getInitials(profile.username)
                    : 'U'}
              </div>
            )}
            {/* Fallback for broken images */}
            <div className="hidden w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 items-center justify-center text-white font-semibold text-sm">
              {profile?.name
                ? getInitials(profile.name)
                : profile?.username
                  ? getInitials(profile.username)
                  : 'U'}
            </div>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                data-profile-dropdown
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed w-64 bg-gray-900/98 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl z-[9999]"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                }}
              >
                {/* User Info */}
                <div className="p-4 border-b border-white/10">
                  <p className="text-white font-medium">
                    {profile?.name || profile?.username || 'User'}
                  </p>
                  <p className="text-white/60 text-sm">{user.email}</p>
                  {profile?.username && (
                    <p className="text-white/50 text-sm">@{profile.username}</p>
                  )}
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <motion.button
                    onClick={goToProfile}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors text-white/80 hover:text-white"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Your Profile</span>
                  </motion.button>

                  <motion.button
                    onClick={goToMyWorkouts}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors text-white/80 hover:text-white"
                  >
                    <Dumbbell className="w-5 h-5" />
                    <span className="font-medium">My Workouts</span>
                  </motion.button>

                  <motion.button
                    onClick={goToMyPlanner}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors text-white/80 hover:text-white"
                  >
                    <CalendarDays className="w-5 h-5" />
                    <span className="font-medium">My Planner</span>
                  </motion.button>

                  <AdminPanelMenuItem />

                  <motion.button
                    onClick={() => {
                      navigate('/settings');
                      setIsOpen(false);
                    }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors text-white/80 hover:text-white"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                  </motion.button>

                  {/* Divider */}
                  <div className="border-t border-white/10 my-2"></div>

                  <motion.button
                    onClick={handleSignOut}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors text-red-400 hover:text-red-300"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign out</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};