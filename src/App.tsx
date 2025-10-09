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
            duration: 3000,
            style: {
              background: 'linear-gradient(to right, rgba(6, 182, 212, 0.9), rgba(59, 130, 246, 0.9))',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '16px',
              borderRadius: '12px',
              padding: '16px 24px',
              boxShadow: '0 4px 12px rgba(0, 255, 247, 0.3)',
              border: '2px solid rgba(0, 255, 247, 0.3)',
            },
            success: {
              style: {
                background: 'linear-gradient(to right, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))',
                border: '2px solid rgba(16, 185, 129, 0.5)',
              },
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              style: {
                background: 'linear-gradient(to right, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
                border: '2px solid rgba(239, 68, 68, 0.5)',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </NotificationProvider>
    </AuthProvider>
  );
}