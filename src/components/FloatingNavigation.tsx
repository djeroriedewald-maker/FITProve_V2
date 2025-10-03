import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  BarChart2, 
  Layers, 
  Users, 
  UserPlus, 
  Bot,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';

type NavItem = {
  name: string;
  icon: React.ElementType;
  path?: string;
  color: string;
  action?: () => void;
  isSpecial?: boolean;
};

interface FloatingNavigationProps {
  onAIChatToggle?: () => void;
}

export function FloatingNavigation({ onAIChatToggle }: FloatingNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  const navigationItems: NavItem[] = [
    { name: 'Home', icon: Home, path: '/', color: '#00E5FF' },
    { name: 'Stats', icon: BarChart2, path: '/stats', color: '#B400FF' },
    { name: 'Modules', icon: Layers, path: '/modules', color: '#FF6B35' },
    { name: 'Community', icon: Users, path: '/community', color: '#00FF87' },
    { name: 'Friends', icon: UserPlus, path: '/friends', color: '#FF1493' },
    { 
      name: 'AI Chat', 
      icon: Bot, 
      color: '#FFD700', 
      action: () => {
        onAIChatToggle?.();
        setIsOpen(false);
      },
      isSpecial: true
    },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const mainButtonVariants = {
    closed: { 
      rotate: 0,
      scale: 1,
    },
    open: { 
      rotate: 45,
      scale: 1.1,
    },
    hover: {
      scale: 1.15,
      rotate: isOpen ? 45 : 0,
    }
  };

  const menuItemVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.3, 
      y: 20,
    },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 20,
      }
    }),
    exit: (i: number) => ({
      opacity: 0,
      scale: 0.3,
      y: 10,
      transition: {
        delay: (navigationItems.length - i) * 0.03,
        duration: 0.2,
      }
    })
  };

  return (
    <div 
      ref={menuRef} 
      className="fixed z-[99999]"
      style={{ 
        position: 'fixed',
        bottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        right: '1.5rem',
        zIndex: 99999,
        pointerEvents: 'auto'
      }}
    >
      {/* Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-20 right-0 flex flex-col-reverse gap-4"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = Boolean(item.path && location.pathname === item.path);
              
              return (
                <motion.div
                  key={item.name}
                  custom={index}
                  variants={menuItemVariants}
                  whileHover={{ 
                    scale: 1.1,
                    x: -10,
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  {/* Menu Item Content */}
                  {item.path ? (
                    <Link
                      to={item.path}
                      className="flex items-center justify-center relative"
                    >
                      <MenuItemButton 
                        icon={Icon} 
                        color={item.color} 
                        isActive={isActive}
                        isSpecial={item.isSpecial}
                      />
                      <MenuItemLabel name={item.name} />
                    </Link>
                  ) : (
                    <button
                      onClick={item.action}
                      className="flex items-center justify-center relative"
                    >
                      <MenuItemButton 
                        icon={Icon} 
                        color={item.color} 
                        isActive={false}
                        isSpecial={item.isSpecial}
                      />
                      <MenuItemLabel name={item.name} />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Action Button */}
      <motion.button
        onClick={toggleMenu}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        variants={mainButtonVariants}
        animate={isOpen ? 'open' : (isHovered ? 'hover' : 'closed')}
        whileTap={{ scale: 0.9 }}
        className="relative w-16 h-16 rounded-2xl shadow-2xl overflow-hidden group"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: isOpen 
              ? [
                  'linear-gradient(45deg, #FF6B35, #B400FF)',
                  'linear-gradient(45deg, #B400FF, #00E5FF)',
                  'linear-gradient(45deg, #00E5FF, #FF6B35)',
                ]
              : [
                  'linear-gradient(135deg, #00E5FF, #B400FF)',
                  'linear-gradient(135deg, #B400FF, #FF6B35)',
                  'linear-gradient(135deg, #FF6B35, #00E5FF)',
                ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Particle effect overlay */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              style={{
                left: `${20 + (i * 10)}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                scale: [0.5, 1, 0.5],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2 + (i * 0.2),
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-7 h-7 text-white" strokeWidth={2.5} />
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(0,229,255,0.6) 0%, transparent 70%)',
            filter: 'blur(10px)',
          }}
          animate={{
            scale: isHovered ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: isHovered ? Infinity : 0,
          }}
        />
      </motion.button>

      {/* Sparkle effects around main button */}
      <AnimatePresence>
        {isHovered && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${-10 + Math.random() * 80}px`,
                  top: `${-10 + Math.random() * 80}px`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  rotate: [0, 180],
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Menu Item Button Component
interface MenuItemButtonProps {
  icon: React.ElementType;
  color: string;
  isActive?: boolean;
  isSpecial?: boolean;
}

function MenuItemButton({ icon: Icon, color, isActive, isSpecial }: MenuItemButtonProps) {
  return (
    <div
      className={`relative w-12 h-12 rounded-xl shadow-lg overflow-hidden ${
        isActive ? 'ring-2 ring-white ring-opacity-50' : ''
      }`}
      style={{
        background: isActive 
          ? `linear-gradient(135deg, ${color}, ${color}cc)`
          : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      {/* Special AI Chat button extra effects */}
      {isSpecial && (
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(45deg, #FFD700, #FFA500)',
              'linear-gradient(45deg, #FFA500, #FF8C00)',
              'linear-gradient(45deg, #FF8C00, #FFD700)',
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Icon */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <Icon
          className="w-5 h-5 text-white transition-all duration-200"
          style={{
            filter: isActive || isSpecial 
              ? `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 12px ${color})` 
              : 'none',
          }}
          strokeWidth={isActive ? 2.5 : 2}
        />
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

// Menu Item Label Component
interface MenuItemLabelProps {
  name: string;
}

function MenuItemLabel({ name }: MenuItemLabelProps) {
  return (
    <motion.div
      className="absolute right-16 top-1/2 transform -translate-y-1/2 pointer-events-none"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div
        className="px-3 py-2 rounded-lg text-white text-sm font-semibold whitespace-nowrap shadow-lg"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {name}
        {/* Arrow pointing to button */}
        <div
          className="absolute left-full top-1/2 transform -translate-y-1/2"
          style={{
            width: 0,
            height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderLeft: '6px solid rgba(0, 0, 0, 0.8)',
          }}
        />
      </div>
    </motion.div>
  );
}