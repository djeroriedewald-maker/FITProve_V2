import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, Layers, Users, UserPlus } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';

type NavItem = {
  name: string;
  icon: React.ElementType;
  path: string;
  color: string;
};

const navigationItems: NavItem[] = [
  { name: 'Home', icon: Home, path: '/', color: '#00E5FF' },
  { name: 'Stats', icon: BarChart2, path: '/stats', color: '#B400FF' },
  { name: 'Modules', icon: Layers, path: '/modules', color: '#FF6B35' },
  { name: 'Community', icon: Users, path: '/community', color: '#00FF87' },
  { name: 'Friends', icon: UserPlus, path: '/friends', color: '#FF1493' },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav 
      className="w-full nav-glass"
      style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    >
      <div className="max-w-lg mx-auto px-2">
        <div className="flex items-center justify-between h-20">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex flex-col items-center justify-center flex-1 h-full relative group touch-manipulation"
                >
                  <motion.div
                    className="flex flex-col items-center space-y-2"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Icon container with glass effect */}
                    <div
                      className={`relative p-3 rounded-2xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-glass-white-heavy shadow-lg' 
                          : 'bg-glass-white-light group-hover:bg-glass-white'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 transition-all duration-300 ${
                          isActive
                            ? 'stroke-[2.5px]'
                            : 'stroke-2 group-hover:stroke-[2.5px]'
                        }`}
                        style={{
                          color: isActive ? item.color : '#ffffff',
                          filter: isActive 
                            ? `drop-shadow(0 0 8px ${item.color}) drop-shadow(0 0 16px ${item.color})`
                            : 'none'
                        }}
                      />
                      
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          className="absolute -bottom-1 left-1/2 w-2 h-2 rounded-full transform -translate-x-1/2"
                          style={{ backgroundColor: item.color }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      )}

                      {/* Hover glow effect */}
                      <div 
                        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                          isActive ? 'opacity-30' : ''
                        }`}
                        style={{
                          background: `radial-gradient(circle, ${item.color} 0%, transparent 70%)`
                        }}
                      />
                    </div>

                    {/* Label */}
                    <span 
                      className={`text-xs font-semibold transition-all duration-300 ${
                        isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                      }`}
                      style={{
                        textShadow: isActive ? `0 0 10px ${item.color}` : 'none'
                      }}
                    >
                      {item.name}
                    </span>
                  </motion.div>

                  {/* Background pulse for active state */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl opacity-10"
                      style={{ backgroundColor: item.color }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </Link>
              );
            })}
        </div>
      </div>
    </nav>
  );
}
