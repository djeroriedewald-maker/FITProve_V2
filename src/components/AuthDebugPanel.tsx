import { useAuth } from '../contexts/AuthContext';

/**
 * Debug component to show current authentication status
 * Add this to any page to debug auth issues
 */
export function AuthDebugPanel() {
  const { user, profile, isLoading, error } = useAuth();
  
  if (!import.meta.env.DEV) return null; // Only show in development

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">🔍 Auth Debug</div>
      
      <div className="space-y-1">
        <div>
          <span className="text-blue-300">Loading:</span> {isLoading ? '✅' : '❌'}
        </div>
        
        <div>
          <span className="text-blue-300">User:</span> {user ? '✅' : '❌'}
        </div>
        
        {user && (
          <div className="text-green-300 text-xs">
            {user.email} ({user.id.substring(0, 8)}...)
          </div>
        )}
        
        <div>
          <span className="text-blue-300">Profile:</span> {profile ? '✅' : '❌'}
        </div>
        
        {profile && (
          <div className="text-green-300 text-xs">
            {profile.displayName}
          </div>
        )}
        
        {error && (
          <div className="text-red-300 text-xs">
            Error: {error.message}
          </div>
        )}
        
        <div className="pt-2 border-t border-gray-600">
          <div className="text-blue-300">LocalStorage:</div>
          <div className="text-xs">
            {typeof window !== 'undefined' && localStorage.getItem('fitprove-auth-token') ? '✅' : '❌'}
          </div>
        </div>
      </div>
    </div>
  );
}