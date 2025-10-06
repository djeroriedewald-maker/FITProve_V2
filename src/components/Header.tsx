import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import NotificationPanel from './ui/NotificationPanel';
import AvatarDropdown from './ui/AvatarDropdown';

export default function Header() {
  const { user, profile } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.avatar_url) {
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(profile.avatar_url);
      if (data) {
        setAvatarUrl(data.publicUrl);
      }
    }
  }, [profile]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#08090B]/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex justify-between items-center px-4 py-2">
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="FitProve" className="h-8 w-auto" />
        </Link>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Bell className="w-6 h-6" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full" />
              )}
            </button>
            <AnimatePresence>
              {isNotificationsOpen && (
                <NotificationPanel 
                  onClose={() => setIsNotificationsOpen(false)}
                  setHasUnread={setHasUnread}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Avatar Dropdown */}
          <div className="relative">
            <AvatarDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
