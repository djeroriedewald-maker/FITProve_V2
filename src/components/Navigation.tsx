import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, Layers, Users, UserPlus } from 'lucide-react';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

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

/**
 * Ensures a fixed, always-on-screen bottom nav:
 * - position: fixed + left/right: 0 (avoids 100vw horizontal scrollbars)
 * - safe-area padding for iOS (env(safe-area-inset-bottom))
 * - reserves page space by setting a CSS var + body padding-bottom to nav height
 * - super high z-index so it stays above other content
 */
export function Navigation() {
  const location = useLocation();
  const navRef = useRef<HTMLElement | null>(null);

  // Reserve space so content isn't hidden behind the fixed bar.
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;

    const updateBodyPadding = () => {
      const el = navRef.current;
      const height = el ? el.offsetHeight : 80;
      // Keep a CSS var in case your layout wants to use it too
      document.documentElement.style.setProperty('--app-bottom-nav-height', `${height}px`);
      document.body.style.paddingBottom = `${height}px`;
    };

    updateBodyPadding();

    // Recompute on viewport or font-size changes
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateBodyPadding) : null;

    if (ro && navRef.current) ro.observe(navRef.current);

    const onResize = () => updateBodyPadding();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (ro && navRef.current) ro.unobserve(navRef.current);
      // Clean up only if we set it
      document.documentElement.style.removeProperty('--app-bottom-nav-height');
      document.body.style.paddingBottom = '';
    };
  }, []);

  const navigationElement = (
    <nav
      ref={navRef as React.RefObject<HTMLElement>}
      className="nav-glass"
      style={{
        position: 'fixed',
        left: 0,
        right: 0, // Use left/right instead of width:100vw to avoid horizontal scrollbars
        bottom: 0,
        zIndex: 2147483647, // keep it above everything
        // Height + safe-area. The inner wrapper also adds bottom padding so content isn't clipped on iOS.
        height: '72px',
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label="Bottom navigation"
    >
      <div
        className="max-w-lg mx-auto px-2"
        style={{
          // Make space for iOS home indicator if present
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-between h-[72px]">
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
                        isActive ? 'stroke-[2.5px]' : 'stroke-2 group-hover:stroke-[2.5px]'
                      }`}
                      style={{
                        color: isActive ? item.color : '#ffffff',
                        filter: isActive
                          ? `drop-shadow(0 0 8px ${item.color}) drop-shadow(0 0 16px ${item.color})`
                          : 'none',
                      }}
                    />

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 w-2 h-2 rounded-full transform -translate-x-1/2"
                        style={{ backgroundColor: item.color }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      />
                    )}

                    {/* Hover glow effect */}
                    <div
                      className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                        isActive ? 'opacity-30' : ''
                      }`}
                      style={{
                        background: `radial-gradient(circle, ${item.color} 0%, transparent 70%)`,
                      }}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={`text-xs font-semibold transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                    }`}
                    style={{
                      textShadow: isActive ? `0 0 10px ${item.color}` : 'none',
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
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );

  // Use portal to ensure navigation is always rendered at document level
  // Guard for SSR / non-DOM environments
  if (typeof document === 'undefined' || !document?.body) {
    return null;
  }

  return createPortal(navigationElement, document.body);
}
