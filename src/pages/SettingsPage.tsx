// src/pages/SettingsPage.tsx
import React, { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { NotificationPreferences } from '../components/ui/NotificationPreferences';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../lib/api';
import { GlassCard, GlassButton } from '../components/ui/GlassCard';
import {
  Settings as SettingsIcon,
  Shield,
  Globe,
  MessageCircle,
  Users,
  Palette,
  Scale,
  Save,
  CheckCircle,
  ArrowLeft,
  Bell,
} from 'lucide-react';

// Utility for metric system persistence
const METRIC_KEY = 'fitprove_metric_system';

function getSavedMetricSystem() {
  if (typeof window === 'undefined') return 'kg';
  return localStorage.getItem(METRIC_KEY) || 'kg';
}

function saveMetricSystem(val: string) {
  if (typeof window !== 'undefined') localStorage.setItem(METRIC_KEY, val);
}

type SettingsSection = {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  content: React.ReactNode;
};

export default function SettingsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();

  // Notification preferences (kept top-level so UI can control it)
  const [notificationPrefs, setNotificationPrefs] = useState<{
    events: Array<'in_app' | 'email' | 'push'>;
    todos: Array<'in_app' | 'email' | 'push'>;
    workouts: Array<'in_app' | 'email' | 'push'>;
  }>(() => {
    if (profile?.notification_preferences) {
      return {
        events: profile.notification_preferences.events || ['in_app'],
        todos: profile.notification_preferences.todos || ['in_app'],
        workouts: profile.notification_preferences.workouts || ['in_app'],
      };
    }
    return { events: ['in_app'], todos: ['in_app'], workouts: ['in_app'] };
  });

  const [isPublic, setIsPublic] = useState(profile?.isPublic ?? false);
  const [allowFollow, setAllowFollow] = useState(profile?.allowFollow ?? false);
  const [allowDirectMessages, setAllowDirectMessages] = useState(
    profile?.allowDirectMessages ?? false
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [metricSystem, setMetricSystem] = useState<string>(getSavedMetricSystem());

  // Keep settings in sync with profile changes
  useEffect(() => {
    setIsPublic(profile?.isPublic ?? false);
    setAllowFollow(profile?.allowFollow ?? false);
    setAllowDirectMessages(profile?.allowDirectMessages ?? false);
    if (profile?.notification_preferences) {
      setNotificationPrefs(profile.notification_preferences);
    }
  }, [profile]);

  if (!profile) {
    return (
      <div className="min-h-screen pb-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-40 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <GlassCard className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="text-white/80">Loading settings...</span>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateUserProfile({
        userId: profile.id,
        displayName: profile.displayName,
        username: profile.username,
        bio: profile.bio,
        isPublic,
        allowFollow,
        allowDirectMessages,
        notificationPreferences: notificationPrefs,
        // You may later persist metricSystem server-side as well
      });
      saveMetricSystem(metricSystem);
      await refreshProfile();
      setMessage('Settings saved successfully!');
    } catch (error) {
      setMessage('Failed to save settings. Please try again.');
      // eslint-disable-next-line no-console
      console.error('Save settings error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Sections config
  const settingsSections: SettingsSection[] = [
    {
      title: 'Reminders & Notifications',
      icon: Bell,
      content: (
        <div className="space-y-4">
          <div className="mb-2">
            <div className="text-white font-medium mb-1">
              Choose what you want to be reminded about, and how:
            </div>
            <div className="text-white/60 text-sm">
              You can receive reminders for events and to-dos via in-app, email, or push
              notifications.
            </div>
          </div>
          <Suspense fallback={<div className="text-white/60">Loading...</div>}>
            <NotificationPreferences value={notificationPrefs} onChange={setNotificationPrefs} />
          </Suspense>
        </div>
      ),
    },
    {
      title: 'Units & Measurements',
      icon: Scale,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <motion.label
              className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                metricSystem === 'kg'
                  ? 'border-primary bg-primary/10 shadow-neon-cyan'
                  : 'border-white/20 hover:border-white/40'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="radio"
                name="metric"
                value="kg"
                checked={metricSystem === 'kg'}
                onChange={(e) => setMetricSystem(e.target.value)}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-lg font-semibold text-white mb-1">Metric</div>
                <div className="text-sm text-white/60">kg, cm, km</div>
              </div>
            </motion.label>

            <motion.label
              className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                metricSystem === 'lb'
                  ? 'border-secondary bg-secondary/10 shadow-neon-purple'
                  : 'border-white/20 hover:border-white/40'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="radio"
                name="metric"
                value="lb"
                checked={metricSystem === 'lb'}
                onChange={(e) => setMetricSystem(e.target.value)}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-lg font-semibold text-white mb-1">Imperial</div>
                <div className="text-sm text-white/60">lb, ft/in, mi</div>
              </div>
            </motion.label>
          </div>
        </div>
      ),
    },
    {
      title: 'Appearance',
      icon: Palette,
      content: (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-medium mb-1">Theme Mode</div>
            <div className="text-white/60 text-sm">Toggle between light and dark mode</div>
          </div>
          <ThemeToggle />
        </div>
      ),
    },
    {
      title: 'Privacy & Social',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <motion.div
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-white font-medium">Public Profile</div>
                <div className="text-white/60 text-sm">Allow your profile to be discoverable</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => {
                  setIsPublic(e.target.checked);
                  if (!e.target.checked) setAllowFollow(false);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </motion.div>

          <motion.div
            className={`flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 transition-opacity ${
              !isPublic ? 'opacity-50' : ''
            }`}
            whileHover={isPublic ? { backgroundColor: 'rgba(255, 255, 255, 0.08)' } : {}}
          >
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-white font-medium">Allow Followers</div>
                <div className="text-white/60 text-sm">Let other users follow your activities</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowFollow}
                onChange={(e) => setAllowFollow(e.target.checked)}
                disabled={!isPublic}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary disabled:cursor-not-allowed" />
            </label>
          </motion.div>

          <motion.div
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-white font-medium">Direct Messages</div>
                <div className="text-white/60 text-sm">Allow DMs from users you follow</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowDirectMessages}
                onChange={(e) => setAllowDirectMessages(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
            </label>
          </motion.div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526] relative overflow-hidden">
      {/* Animated, layered glass gradients for depth */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-4 w-72 h-72 bg-gradient-to-br from-cyan-400/30 to-blue-700/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-4 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-orange-400/30 to-yellow-500/30 rounded-full blur-3xl animate-pulse delay-2000" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-40 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-2 sm:px-4 pt-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <GlassButton
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2 text-lg font-bold text-cyan-300 hover:text-white"
            style={{ textShadow: '0 2px 8px #00fff7aa' }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </GlassButton>

          <GlassCard variant="hero" className="text-center bg-gradient-to-br from-cyan-900/60 to-black/80 shadow-2xl border-2 border-cyan-400/30 rounded-3xl p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-neon-cyan border-4 border-cyan-400/40 animate-pulse">
                <SettingsIcon className="w-10 h-10 text-white drop-shadow-neon-cyan" />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-200 via-white to-cyan-400 bg-clip-text text-transparent mb-2 tracking-tight" style={{ textShadow: '0 2px 16px #00fff7cc' }}>
              Settings
            </h1>
            <p className="text-cyan-100/80 text-lg font-medium">Customize your FITProve experience</p>
          </GlassCard>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {settingsSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <GlassCard className="rounded-2xl bg-gradient-to-br from-white/5 to-cyan-900/10 border-2 border-cyan-400/10 shadow-xl p-4 sm:p-6">
                <div className="flex items-center mb-6 gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center border-2 border-cyan-400/30 shadow-neon-cyan animate-pulse">
                    <section.icon className="w-6 h-6 text-cyan-300 drop-shadow-neon-cyan" />
                  </div>
                  <h2 className="text-2xl font-bold text-cyan-100 tracking-tight" style={{ textShadow: '0 2px 8px #00fff7aa' }}>{section.title}</h2>
                </div>
                <div className="text-base sm:text-lg">{section.content}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Save Button & Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10"
        >
          <GlassCard className="rounded-2xl bg-gradient-to-br from-cyan-900/60 to-black/80 border-2 border-cyan-400/20 shadow-xl p-4">
            <div className="text-center">
              <GlassButton
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                className="w-full md:w-auto px-10 py-4 text-xl font-bold rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-neon-cyan border-2 border-cyan-300/40 hover:scale-105 transition-transform"
                style={{ textShadow: '0 2px 8px #00fff7aa' }}
              >
                <div className="flex items-center justify-center space-x-2">
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Settings</span>
                    </>
                  )}
                </div>
              </GlassButton>

              {message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-4 flex items-center justify-center space-x-2 p-4 rounded-2xl text-lg font-semibold shadow-lg border-2 ${
                    message.includes('success')
                      ? 'bg-green-500/20 border-green-400/40 text-green-200'
                      : 'bg-red-500/20 border-red-400/40 text-red-200'
                  }`}
                  style={{ textShadow: '0 2px 8px #00fff7aa' }}
                >
                  {message.includes('success') && <CheckCircle className="w-5 h-5" />}
                  <span>{message}</span>
                </motion.div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
