import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown, UserCircle, Shield, Calendar, Dumbbell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

type MenuItem = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  action: () => void | Promise<void>;
  danger?: boolean;
};

export default function AvatarDropdown() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Focus first item when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => firstItemRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
  }, [isOpen]);

  const handleLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
      setIsOpen(false);
      // App component handles splash screen on auth change
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Error logging out';
      toast.error(message);
    }
  }, []);

  // Check if user is admin
  const isAdmin = profile?.role === 'admin' || profile?.is_admin;

  const menuItems: MenuItem[] = [
    {
      icon: UserCircle,
      label: 'Profile',
      action: () => {
        navigate('/profile');
        setIsOpen(false);
      },
    },
    {
      icon: Dumbbell,
      label: 'My Workouts',
      action: () => {
        navigate('/modules/workout/my-workouts');
        setIsOpen(false);
      },
    },
    {
      icon: Calendar,
      label: 'My Planner',
      action: () => {
        navigate('/modules/workout/planner');
        setIsOpen(false);
      },
    },
    // Add Admin page if user is admin
    ...(isAdmin ? [{
      icon: Shield,
      label: 'Admin Panel',
      action: () => {
        navigate('/admin');
        setIsOpen(false);
      },
    }] : []),
    {
      icon: Settings,
      label: 'Settings',
      action: () => {
        navigate('/settings');
        setIsOpen(false);
      },
    },
    {
      icon: LogOut,
      label: 'Log Out',
      action: handleLogout,
      danger: true,
    },
  ];

  if (!user) return null;

  const initials = (
    profile?.displayName?.trim()?.[0] ??
    profile?.username?.trim()?.[0] ??
    'U'
  ).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen((v) => !v)}
        className="relative flex items-center gap-2 group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open user menu"
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px]">
          <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
            {profile?.avatarUrl ? (
              <>
                <img
                  src={profile.avatarUrl}
                  alt={profile?.displayName || profile?.username || 'User avatar'}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {/* Hidden fallback sibling for broken images */}
                <div className="hidden w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 items-center justify-center text-white font-semibold text-lg">
                  {initials}
                </div>
              </>
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-white font-semibold text-lg">
                {initials}
              </div>
            )}
          </div>
        </div>

        {/* Online indicator */}
        <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden
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
            className="absolute top-16 left-0 w-64 max-w-[90vw] bg-[#08090B]/95 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl z-50"
            role="menu"
            aria-label="User menu"
          >
            {/* User Info */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-br from-cyan-500/10 to-purple-500/10">
              <p className="text-white font-medium text-lg">{profile?.displayName || 'User'}</p>
              {profile?.username && <p className="text-cyan-400 text-sm font-medium">@{profile.username}</p>}
              <p className="text-gray-400 text-xs mt-1">{user.email}</p>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isFirst = index === 0;
                return (
                  <motion.button
                    key={item.label}
                    ref={isFirst ? firstItemRef : undefined}
                    onClick={item.action}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                      item.danger
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-white/80 hover:text-white'
                    }`}
                    role="menuitem"
                  >
                    <Icon className="w-5 h-5" aria-hidden />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
