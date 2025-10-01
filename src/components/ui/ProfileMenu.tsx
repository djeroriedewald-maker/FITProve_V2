// removed duplicate import
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Dumbbell, CalendarDays } from 'lucide-react';
import { AdminPanelMenuItem } from './AdminPanelMenuItem2';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
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
      <button
        onClick={handleSignIn}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
      >
        <User className="w-4 h-4" />
        <span>Sign in</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 focus:outline-none"
      >
        {profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.displayName}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-neon-yellow flex items-center justify-center text-black text-sm font-medium shadow-lg">
            {profile?.displayName ? getInitials(profile.displayName) : '??'}
          </div>
        )}
      </button>

      {isOpen && (
  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-black shadow-xl border border-neon-yellow/40 z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-sm text-neon-yellow border-b border-neon-yellow/40">
              <div className="font-medium text-neon-yellow">{profile?.displayName}</div>
              <div className="text-xs">@{profile?.username}</div>
            </div>
            <button 
              onClick={goToProfile}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-neon-purple hover:bg-neon-purple/10 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Your Profile</span>
            </button>
            <button 
              onClick={goToMyWorkouts}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-neon-purple hover:bg-neon-purple/10 rounded-lg transition-colors"
            >
              <Dumbbell className="w-4 h-4" />
              <span>My Workouts</span>
            </button>
            <button 
              onClick={goToMyPlanner}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-neon-purple hover:bg-neon-purple/10 rounded-lg transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              <span>My Planner</span>
            </button>
            {/* [ProfileMenu] Rendering <AdminPanelMenuItem /> */}
            <AdminPanelMenuItem />
            <button 
              onClick={() => { navigate('/settings'); setIsOpen(false); }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-neon-purple hover:bg-neon-purple/10 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <div className="border-t border-neon-yellow/40 my-1"></div>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
