import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function AuthDebugPanel() {
  const { user, profile, isLoading, error } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSessionInfo({ session, error });
    };

    const checkStorage = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('fitprove-auth-token');
        try {
          setStorageInfo(stored ? JSON.parse(stored) : null);
        } catch (e) {
          setStorageInfo({ error: 'Invalid JSON in storage' });
        }
      }
    };

    checkSession();
    checkStorage();

    // Update every 5 seconds
    const interval = setInterval(() => {
      checkSession();
      checkStorage();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-2 rounded text-xs z-50"
      >
        🔐 Auth Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-y-auto text-xs z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-800">Auth Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* Auth Context State */}
        <div>
          <h4 className="font-semibold text-gray-700">Auth Context:</h4>
          <div className="bg-gray-100 p-2 rounded">
            <div>User: {user ? '✅ Logged in' : '❌ Not logged in'}</div>
            <div>Profile: {profile ? '✅ Loaded' : '❌ Not loaded'}</div>
            <div>Loading: {isLoading ? '🔄 Yes' : '✅ No'}</div>
            <div>Error: {error ? `❌ ${error.message}` : '✅ None'}</div>
            {user && (
              <div className="mt-1">
                <div>ID: {user.id.substring(0, 8)}...</div>
                <div>Email: {user.email}</div>
              </div>
            )}
          </div>
        </div>

        {/* Session Info */}
        <div>
          <h4 className="font-semibold text-gray-700">Session:</h4>
          <div className="bg-gray-100 p-2 rounded">
            {sessionInfo?.session ? (
              <>
                <div>✅ Valid session</div>
                <div>Expires: {new Date(sessionInfo.session.expires_at * 1000).toLocaleTimeString()}</div>
                <div>Token: {sessionInfo.session.access_token ? '✅ Present' : '❌ Missing'}</div>
              </>
            ) : (
              <div>❌ No session</div>
            )}
            {sessionInfo?.error && (
              <div className="text-red-600">Error: {sessionInfo.error.message}</div>
            )}
          </div>
        </div>

        {/* Storage Info */}
        <div>
          <h4 className="font-semibold text-gray-700">localStorage:</h4>
          <div className="bg-gray-100 p-2 rounded">
            {storageInfo ? (
              <>
                <div>✅ Token stored</div>
                <div>User: {storageInfo.user?.id ? '✅' : '❌'}</div>
                <div>Access: {storageInfo.access_token ? '✅' : '❌'}</div>
                <div>Refresh: {storageInfo.refresh_token ? '✅' : '❌'}</div>
              </>
            ) : (
              <div>❌ No stored token</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div>
          <h4 className="font-semibold text-gray-700">Actions:</h4>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                const { data, error } = await supabase.auth.refreshSession();
                console.log('Refresh result:', { data, error });
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                console.log('Auth state:', { user, profile, sessionInfo, storageInfo });
              }}
              className="bg-green-500 text-white px-2 py-1 rounded text-xs"
            >
              Log State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}