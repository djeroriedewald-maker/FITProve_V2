import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../lib/api';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const [isPublic, setIsPublic] = useState(profile?.isPublic ?? false);
  const [allowFollow, setAllowFollow] = useState(profile?.allowFollow ?? false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!profile) return <div className="p-8">Loading...</div>;

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateUserProfile({
        userId: profile.id,
        displayName: profile.displayName,
        username: profile.username,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        fitnessGoals: profile.fitnessGoals,
        isPublic,
        allowFollow,
      });
      await refreshProfile();
      setMessage('Settings saved!');
    } catch (e) {
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center relative">
      {/* Close button top right */}
      <button
        onClick={() => navigate(-1)}
        aria-label="Close settings"
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 shadow focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 w-full max-w-md space-y-6">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={e => {
              setIsPublic(e.target.checked);
              if (!e.target.checked) setAllowFollow(false);
            }}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">Allow my profile to be found (public)</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allowFollow"
            checked={allowFollow}
            onChange={e => setAllowFollow(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            disabled={!isPublic}
          />
          <label htmlFor="allowFollow" className="text-sm text-gray-700 dark:text-gray-300">Allow other users to follow me</label>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary text-white rounded-lg font-semibold shadow-sm hover:bg-primary/90 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {message && <div className="text-sm text-green-600 dark:text-green-400">{message}</div>}
      </div>
    </div>
  );
}
