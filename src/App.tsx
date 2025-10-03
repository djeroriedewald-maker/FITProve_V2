import { useState, useEffect, useCallback } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { router } from './lib/router';
import SplashScreen from './components/SplashScreenSimple';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Memoize to avoid re-renders from changing function identity
  const handleAuthSuccess = useCallback(() => {
    // Called by SplashScreen after successful auth
    setShowSplash(false);
  }, []);

  useEffect(() => {
    // Keep splash visible while loading, then decide based on user
    if (isLoading) return;

    if (user) {
      setShowSplash(false);
    } else {
      setShowSplash(true);
    }
  }, [user, isLoading]);

  // Always show splash first; if no user yet, splash acts as auth gate
  if (showSplash || !user) {
    return <SplashScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Optional: show a quick spinner during transition phases
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  // Main app once authenticated
  return (
    <NotificationProvider>
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
        }}
      />
    </NotificationProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
