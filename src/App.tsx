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

  const handleAuthSuccess = useCallback(() => {
    setShowSplash(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      setShowSplash(false);
    } else {
      setShowSplash(true);
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  return showSplash ? (
    <SplashScreen onAuthSuccess={handleAuthSuccess} />
  ) : (
    <RouterProvider router={router} />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
        <Toaster 
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff'
            }
          }}
        />
      </NotificationProvider>
    </AuthProvider>
  );
}