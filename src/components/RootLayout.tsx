import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Toaster } from 'sonner';
import { Header } from './Header';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-black dark:bg-black">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)',
          },
          className: 'dark:bg-gray-800 dark:text-white dark:border-gray-700',
        }}
      />
      <Header />
      {/* Add enough top and bottom padding so content never goes under header or nav */}
      <main className="pt-16 pb-16">
        <Outlet />
      </main>
      <Navigation />
    </div>
  );
}

