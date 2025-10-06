import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function AvatarDebugPanel() {
  const { user, profile, refreshProfile } = useAuth();

  const handleForceRefresh = async () => {
    console.log('🔄 Forcing profile refresh...');
    try {
      await refreshProfile({ force: true });
      console.log('✅ Profile refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing profile:', error);
    }
  };

  const handleCheckDirectDB = async () => {
    if (!user) return;
    
    console.log('🔍 Checking database directly...');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('❌ Database error:', error);
      } else {
        console.log('📋 Direct database result:', data);
      }
    } catch (error) {
      console.error('❌ Error checking database:', error);
    }
  };

  if (!import.meta.env.DEV) return null; // Only show in development

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50 space-y-2">
      <div className="font-bold text-yellow-400">🐛 Avatar Debug Panel</div>
      
      <div className="space-y-1">
        <div><span className="text-blue-300">User ID:</span> {user?.id}</div>
        <div><span className="text-blue-300">Profile ID:</span> {profile?.id}</div>
        <div>
          <span className="text-blue-300">Avatar URL:</span> 
          <div className="text-green-300 text-[10px] break-all mt-1">
            {profile?.avatarUrl || 'None'}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleForceRefresh}
          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
        >
          Force Refresh
        </button>
        <button
          onClick={handleCheckDirectDB}
          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
        >
          Check DB
        </button>
      </div>

      {profile?.avatarUrl && (
        <div>
          <div className="text-blue-300 text-[10px] mb-1">Image Preview:</div>
          <img 
            src={profile.avatarUrl} 
            alt="Avatar preview" 
            className="w-16 h-16 rounded-full object-cover border"
            onLoad={() => console.log('✅ Avatar image loaded successfully')}
            onError={(e) => {
              console.error('❌ Avatar image failed to load');
              console.error('URL:', profile.avatarUrl);
              console.error('Error:', e);
            }}
          />
        </div>
      )}
    </div>
  );
}