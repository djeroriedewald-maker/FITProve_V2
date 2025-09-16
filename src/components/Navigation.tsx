import { Link, useLocation } from 'react-router-dom';
import { Home, Dumbbell, BarChart2, Newspaper, Layers, Users } from 'lucide-react';

const navigationItems = [
  { name: 'Home', icon: Home, path: '/' },
  { name: 'Coach', icon: Dumbbell, path: '/coach' },
  { name: 'Stats', icon: BarChart2, path: '/stats' },
  { name: 'News', icon: Newspaper, path: '/news' },
  { name: 'Modules', icon: Layers, path: '/modules' },
  { name: 'Community', icon: Users, path: '/community' },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 z-40">
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
                  isActive
                    ? 'text-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary'
                }`}
              >
                <div
                  className={`relative p-1.5 rounded-lg transition-transform duration-200 ${
                    isActive ? 'scale-110 bg-primary/10' : ''
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${isActive ? 'stroke-[2.5px]' : ''}`}
                  />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full transform -translate-x-1/2" />
                  )}
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
