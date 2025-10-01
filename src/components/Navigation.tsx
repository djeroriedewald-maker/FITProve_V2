// Navigation.tsx
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, Layers, Users, UserPlus } from 'lucide-react';
import React from 'react';

type NavItem = {
  name: string;
  icon: React.ElementType;
  path: string;
};

const navigationItems: NavItem[] = [
  { name: 'Home', icon: Home, path: '/' },
  { name: 'Stats', icon: BarChart2, path: '/stats' },
  // News removed as requested
  { name: 'Modules', icon: Layers, path: '/modules' },
  { name: 'Community', icon: Users, path: '/community' },
  { name: 'Friends', icon: UserPlus, path: '/friends' },
];

export function Navigation() {
  const location = useLocation();

  return (
    <div className="sticky bottom-0 left-0 right-0 z-[60]">
      <nav className="bg-black/30 dark:bg-black/60 backdrop-blur-xl border-t border-white/10 shadow-lg pointer-events-auto">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-200 active:opacity-70 touch-manipulation min-h-[44px] ${
                    isActive ? 'text-[#B400FF]' : 'text-white hover:text-[#B400FF]'
                  }`}
                >
                  <div
                    className={`relative p-1.5 rounded-lg transition-transform duration-200 ${
                      isActive ? 'scale-110 bg-[#B400FF]/10' : ''
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? 'stroke-[2.5px] text-[#B400FF]'
                          : 'text-white'
                      }`}
                      style={{
                        filter: 'drop-shadow(0 0 8px #B400FF) drop-shadow(0 0 16px #00f0ff)',
                      }}
                    />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 w-1 h-1 bg-[#B400FF] rounded-full transform -translate-x-1/2" />
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
