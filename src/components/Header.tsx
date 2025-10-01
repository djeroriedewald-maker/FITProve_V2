// Header.tsx
import { Link } from 'react-router-dom';
import { NotificationDropdown } from './ui/NotificationDropdown';
import { ProfileMenu } from './ui/ProfileMenu';

export function Header() {
  return (
  <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-black shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-[#B400FF] to-white bg-clip-text text-transparent"
            style={{
              filter: 'drop-shadow(0 0 8px #B400FF) drop-shadow(0 0 16px #00f0ff)',
            }}
          >
            FITProve
          </Link>

          {/* Right side navigation items */}
          <div className="flex items-center space-x-6">
            {/* Neon purple notification icon */}
            <div className="text-[#B400FF] drop-shadow-[0_0_8px_#B400FF] hover:scale-110 transition-transform">
              <NotificationDropdown />
            </div>

            {/* Neon purple circle around avatar */}
            <div className="rounded-full ring-2 ring-[#B400FF] ring-offset-2 ring-offset-black hover:ring-4 hover:shadow-[0_0_12px_#B400FF] transition-all">
              <ProfileMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
