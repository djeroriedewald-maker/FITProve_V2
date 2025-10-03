import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  UserCircle,
  Bell,
  Shield
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function AvatarDropdown() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Logged out successfully');
      setIsOpen(false);
      // The App component will handle showing the splash screen
    } catch (error: any) {
      toast.error('Error logging out: ' + error.message);
    }
  };

  const menuItems = [
    {
      icon: UserCircle,
      label: 'View Profile',
      action: () => {
        navigate('/profile');
        setIsOpen(false);
      },
    },
    {
      icon: Settings,
      label: 'Settings',
      action: () => {
        navigate('/settings');
        setIsOpen(false);
      },
    },
    {
      icon: Bell,
      label: 'Notifications',
      action: () => {
        // Future: navigate to notifications
        toast('Notifications coming soon!');
        setIsOpen(false);
      },
    },
    {
      icon: LogOut,
      label: 'Sign Out',
      action: handleLogout,
      danger: true,
    },
  ];

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px]">
          <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.name || 'User'}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-white font-semibold text-lg">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            {/* Fallback for broken images */}
            <div className="hidden w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 items-center justify-center text-white font-semibold text-lg">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>

        {/* Online indicator */}
        <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />
        
        {/* Chevron */}
        <ChevronDown 
          className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed w-64 bg-gray-900/98 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl z-[9999]"
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
            }}
          >
            {/* User Info */}
            <div className="p-4 border-b border-white/10">
              <p className="text-white font-medium">{profile?.name || 'User'}</p>
              <p className="text-white/60 text-sm">{user.email}</p>
              {profile?.username && (
                <p className="text-white/50 text-sm">@{profile.username}</p>
              )}
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={index}
                  onClick={item.action}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    item.danger 
                      ? 'text-red-400 hover:text-red-300' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}