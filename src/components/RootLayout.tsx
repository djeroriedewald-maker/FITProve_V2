import { Outlet } from 'react-router-dom';
import { FloatingNavigation } from './FloatingNavigation';
import { AIChat } from './AIChat';
import { Toaster } from 'sonner';
import { FloatingActionMenu } from './ui/FloatingActionMenu';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function RootLayout() {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const toggleAIChat = () => {
    setIsAIChatOpen(!isAIChatOpen);
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated background with glass morphism */}
      <div className="fixed inset-0 z-0">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary" />

        {/* Floating orbs for depth */}
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(0,229,255,0.3) 0%, transparent 50%)',
            filter: 'blur(40px)',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute top-3/4 -right-20 w-80 h-80 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(180,0,255,0.4) 0%, transparent 60%)',
            filter: 'blur(50px)',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,53,0.5) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 20, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Glass morphism toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            borderRadius: '12px',
          },
          className: 'glass border-white/20',
        }}
      />

      {/* Content wrapper with proper z-index */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main content with enhanced padding and smooth transitions */}
        <main className="flex-1 pt-4 pb-8 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Subtle noise texture overlay for premium feel */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.02] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNose' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* New Floating Navigation System */}
      <FloatingNavigation onAIChatToggle={toggleAIChat} />

      {/* Floating Action Menu */}
      <FloatingActionMenu />

      {/* AI Chat Component */}
      <AIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </div>
  );
}
