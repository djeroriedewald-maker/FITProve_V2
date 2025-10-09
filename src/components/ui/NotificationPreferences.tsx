import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, Smartphone, Calendar, CheckSquare, Dumbbell } from 'lucide-react';

export type NotificationChannel = 'in_app' | 'email' | 'push';
export type ReminderType = 'events' | 'todos' | 'workouts';

export interface NotificationPreferencesProps {
  value: NotificationPreferencesState;
  onChange: (value: NotificationPreferencesState) => void;
}

export interface NotificationPreferencesState {
  events: NotificationChannel[];
  todos: NotificationChannel[];
  workouts: NotificationChannel[];
}

const channelOptions: { key: NotificationChannel; label: string; icon: React.ReactNode }[] = [
  { key: 'in_app', label: 'In-App', icon: <Bell className="w-5 h-5 text-primary" /> },
  { key: 'email', label: 'Email', icon: <Mail className="w-5 h-5 text-blue-400" /> },
  { key: 'push', label: 'Push', icon: <Smartphone className="w-5 h-5 text-green-400" /> },
];

export function NotificationPreferences({ value, onChange }: NotificationPreferencesProps) {
  const handleToggle = (type: ReminderType, channel: NotificationChannel) => {
    const current = value[type];
    if (current.includes(channel)) {
      onChange({ ...value, [type]: current.filter((c) => c !== channel) });
    } else {
      onChange({ ...value, [type]: [...current, channel] });
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-br from-cyan-900/60 to-black/80 border-2 border-cyan-400/20 shadow-xl p-4">
        <div className="flex items-center mb-3 gap-2">
          <Calendar className="w-7 h-7 text-cyan-300 drop-shadow-neon-cyan animate-pulse" />
          <span className="text-cyan-100 font-bold text-lg tracking-tight" style={{ textShadow: '0 2px 8px #00fff7aa' }}>Event Reminders</span>
        </div>
        <div className="flex gap-4 justify-center">
          {channelOptions.map((opt) => (
            <motion.button
              key={opt.key}
              type="button"
              className={`flex flex-col items-center px-6 py-4 rounded-2xl border-2 text-base font-semibold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                value.events.includes(opt.key)
                  ? 'border-cyan-400 bg-cyan-400/10 shadow-neon-cyan scale-105'
                  : 'border-white/20 hover:border-cyan-400/40 bg-black/30'
              }`}
              onClick={() => handleToggle('events', opt.key)}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.07 }}
              style={{ minWidth: 80 }}
            >
              <span className="mb-1">{opt.icon}</span>
              <span className="text-sm text-cyan-100/90 mt-1" style={{ textShadow: '0 2px 8px #00fff7aa' }}>{opt.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-orange-900/60 to-black/80 border-2 border-orange-400/20 shadow-xl p-4">
        <div className="flex items-center mb-3 gap-2">
          <Dumbbell className="w-7 h-7 text-orange-300 drop-shadow-neon-cyan animate-pulse" />
          <span className="text-orange-100 font-bold text-lg tracking-tight" style={{ textShadow: '0 2px 8px #ff6600aa' }}>Workout Reminders</span>
        </div>
        <div className="flex gap-4 justify-center">
          {channelOptions.map((opt) => (
            <motion.button
              key={opt.key}
              type="button"
              className={`flex flex-col items-center px-6 py-4 rounded-2xl border-2 text-base font-semibold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400/50 ${
                value.workouts.includes(opt.key)
                  ? 'border-orange-400 bg-orange-400/10 shadow-neon-cyan scale-105'
                  : 'border-white/20 hover:border-orange-400/40 bg-black/30'
              }`}
              onClick={() => handleToggle('workouts', opt.key)}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.07 }}
              style={{ minWidth: 80 }}
            >
              <span className="mb-1">{opt.icon}</span>
              <span className="text-sm text-orange-100/90 mt-1" style={{ textShadow: '0 2px 8px #ff6600aa' }}>{opt.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-purple-900/60 to-black/80 border-2 border-purple-400/20 shadow-xl p-4">
        <div className="flex items-center mb-3 gap-2">
          <CheckSquare className="w-7 h-7 text-purple-300 drop-shadow-neon-cyan animate-pulse" />
          <span className="text-purple-100 font-bold text-lg tracking-tight" style={{ textShadow: '0 2px 8px #b400ffaa' }}>To-Do Reminders</span>
        </div>
        <div className="flex gap-4 justify-center">
          {channelOptions.map((opt) => (
            <motion.button
              key={opt.key}
              type="button"
              className={`flex flex-col items-center px-6 py-4 rounded-2xl border-2 text-base font-semibold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50 ${
                value.todos.includes(opt.key)
                  ? 'border-purple-400 bg-purple-400/10 shadow-neon-cyan scale-105'
                  : 'border-white/20 hover:border-purple-400/40 bg-black/30'
              }`}
              onClick={() => handleToggle('todos', opt.key)}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.07 }}
              style={{ minWidth: 80 }}
            >
              <span className="mb-1">{opt.icon}</span>
              <span className="text-sm text-purple-100/90 mt-1" style={{ textShadow: '0 2px 8px #b400ffaa' }}>{opt.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
