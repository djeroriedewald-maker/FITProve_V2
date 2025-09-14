
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Toaster } from 'sonner';
import { Header } from './Header';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)'
          },
          className: 'dark:bg-gray-800 dark:text-white dark:border-gray-700'
        }}
      />
      <Header />
      <div className="pt-20 pb-20">
        <Outlet />
      </div>
      <Navigation />
    </div>
  );
}