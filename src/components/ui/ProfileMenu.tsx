// removed duplicate import
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Dumbbell } from 'lucide-react';
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
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white text-sm font-medium shadow-lg">
            {profile?.displayName ? getInitials(profile.displayName) : '??'}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
              <div className="font-medium text-gray-900 dark:text-white">{profile?.displayName}</div>
              <div className="text-xs">@{profile?.username}</div>
            </div>
            <button 
              onClick={goToProfile}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Your Profile</span>
            </button>
            <button 
              onClick={goToMyWorkouts}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Dumbbell className="w-4 h-4" />
              <span>My Workouts</span>
            </button>
            {/* [ProfileMenu] Rendering <AdminPanelMenuItem /> */}
            <AdminPanelMenuItem />
            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
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