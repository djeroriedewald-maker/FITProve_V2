import { Link } from 'react-router-dom';
import { ThemeToggle } from './ui/ThemeToggle';
import { NotificationDropdown } from './ui/NotificationDropdown';
import { InboxButton } from './ui/InboxButton';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfileMenu } from './ui/ProfileMenu';

export function Header() {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
          >
            FITProve
          </Link>

          {/* Right side navigation items */}
          <div className="flex items-center space-x-6">
            <ThemeToggle />
            <NotificationDropdown />
            <InboxButton />
            <button
              onClick={() => navigate('/following')}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Following"
            >
              <Users className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
