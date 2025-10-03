import { Link } from 'react-router-dom';
import { NotificationDropdown } from './ui/NotificationDropdown';
import { ProfileMenu } from './ui/ProfileMenu';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 nav-glass"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Floating background orb */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-4 left-1/4 w-32 h-32 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(0,229,255,0.3) 0%, transparent 60%)',
            filter: 'blur(30px)',
          }}
          animate={{
            x: [-10, 20, -10],
            y: [-5, 5, -5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Enhanced Logo with 3D effect */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-xl rounded-lg group-hover:blur-2xl transition-all duration-300" />
              <div className="relative text-3xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-primary via-white to-secondary bg-clip-text text-transparent drop-shadow-lg">
                  FIT
                </span>
                <span className="bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent drop-shadow-lg">
                  Prove
                </span>
                {/* Animated underline */}
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </Link>
          </motion.div>

          {/* Enhanced Navigation Items */}
          <div className="flex items-center space-x-8">
            {/* Notification with glass effect */}
            <motion.div
              className="relative p-3 glass-light rounded-2xl border border-white/10 hover:border-primary/30 transition-all duration-300 group"
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative text-primary drop-shadow-glow-primary">
                <NotificationDropdown />
              </div>
            </motion.div>

            {/* Profile with enhanced glass morphism */}
            <motion.div
              className="relative p-1 glass-light rounded-2xl border border-white/10 hover:border-secondary/30 transition-all duration-300 group"
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <ProfileMenu />
              </div>
              {/* Glow ring effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-secondary/20"
                animate={{
                  borderColor: [
                    'rgba(180,0,255,0.2)',
                    'rgba(0,229,255,0.2)',
                    'rgba(180,0,255,0.2)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </motion.header>
  );
}
