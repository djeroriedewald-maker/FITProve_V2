import { Outlet } from 'react-router-dom';

import { AIChat } from '../AIChat';
import { Toaster } from 'sonner';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { MainHeader } from './MainHeader';

export function AppLayout() {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const toggleAIChat = () => {
    setIsAIChatOpen(!isAIChatOpen);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Main Header - Fixed at top */}
      <MainHeader />

      {/* Scrollable content area */}
      <div className="fixed inset-0 top-[72px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <main className="relative min-h-[calc(100vh-72px)] pb-24">
          <div className="max-w-7xl mx-auto px-4 pt-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Fixed navigation */}
      <div 
        className="fixed bottom-4 left-4 right-4"
        style={{ zIndex: 999999 }}
      >
        </div>

      {/* AI Chat */}
      <AIChat isOpen={isAIChatOpen} onClose={toggleAIChat} />
      
      {/* Toaster */}
      <Toaster position="top-center" expand={true} richColors />

      {/* Subtle noise texture overlay for premium feel */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.02] mix-blend-multiply"
        style={{
          backgroundImage: 'url("/noise.png")',
          backgroundRepeat: 'repeat',
        }}
      />
    </div>
  );
}