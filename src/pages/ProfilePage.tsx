
import { Link } from 'react-router-dom';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../components/profile/UserProfile';

export function ProfilePage() {
  const { user, profile, isLoading, error, refreshProfile, cancelProfileFetch, getDebugInfo } = useAuth();
  const [isSlow, setIsSlow] = React.useState(false);
  const debug = getDebugInfo?.() ?? { inFlight: false, startedAt: null };

  React.useEffect(() => {
    const t = setTimeout(() => setIsSlow(true), 4000);
    return () => clearTimeout(t);
  }, []);

  // Explicit loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          {isSlow && (
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-300">This is taking longer than expected…</p>
              <button
                onClick={() => refreshProfile({ force: true })}
                className="mt-2 inline-block px-4 py-2 rounded-md bg-primary text-white hover:opacity-90"
              >
                Force refresh
              </button>
              <button
                onClick={() => cancelProfileFetch()}
                className="mt-2 ml-2 inline-block px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 dark:text-white hover:opacity-90"
              >
                Cancel request
              </button>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {debug.inFlight ? 'Fetching…' : 'Idle'}
                {debug.startedAt ? ` • started ${Math.round((Date.now() - debug.startedAt)/1000)}s ago` : ''}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">You're not signed in</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Sign in to view and edit your profile.</p>
          <Link
            to="/signin"
            className="inline-block px-4 py-2 rounded-md bg-primary text-white hover:opacity-90"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Couldn't load your profile</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error.message}</p>
          <Link to="/" className="inline-block px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 dark:text-white">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Signed in but no profile yet (e.g., first-time user); show a gentle placeholder instead of spinner
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Setting things up…</h2>
          <p className="text-gray-600 dark:text-gray-400">We're creating your profile. This may take a moment.</p>
          <div className="mt-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <UserProfile profile={profile} isOwnProfile={true} />
      </div>
    </div>
  );
}