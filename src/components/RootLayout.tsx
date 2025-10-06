import { Outlet } from 'react-router-dom';
import { FloatingNavigation } from './FloatingNavigation';
import { AIChat } from './AIChat';
import { Toaster } from 'sonner';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function RootLayout() {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const toggleAIChat = () => {
    setIsAIChatOpen(!isAIChatOpen);
  };

  return (
    <div className="relative min-h-screen">
      {/* Main content */}
      <Outlet />

      {/* Fixed navigation */}
      <div 
        className="fixed bottom-4 left-4 right-4"
        style={{ zIndex: 999999 }}
      >
        <FloatingNavigation onAIChatToggle={toggleAIChat} />
      </div>

      {/* AI Chat */}
      {/* AI Chat */}
      <AIChat isOpen={isAIChatOpen} onClose={toggleAIChat} />
      
      {/* Toaster */}
      <Toaster position="top-center" expand={true} richColors />
    </div>

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
      <div className="relative min-h-screen pb-24">
        <main className="relative z-10">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Subtle noise texture overlay for premium feel */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.02] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNose' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Navigation Bar - fixed to top of viewport */}
      <div className="fixed z-[9999999] top-4 left-0 right-0 pointer-events-none">
        <div className="max-w-screen-xl mx-auto px-4 pointer-events-auto">
          <FloatingNavigation onAIChatToggle={toggleAIChat} />
        </div>
      </div>

      {/* AI Chat Component */}
      <AIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </>
  );
}
