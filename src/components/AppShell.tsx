import React, { useState } from 'react';
import { FloatingNavigation } from './FloatingNavigation';
import { AIChat } from './AIChat';
import { Toaster } from 'sonner';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  return (
    <>
      {/* Main content */}
      {children}

      {/* Fixed navigation */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-t from-black/80 to-black/0 pb-safe">
        <div className="mx-auto max-w-lg">
          <FloatingNavigation onAIChatToggle={() => setIsAIChatOpen(!isAIChatOpen)} />
        </div>
      </div>

      {/* AI Chat */}
      <AIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />

      {/* Toast notifications */}
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
    </>
  );
}