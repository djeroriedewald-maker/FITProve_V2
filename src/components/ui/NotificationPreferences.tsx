import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, Smartphone, Calendar, CheckSquare } from 'lucide-react';

export type NotificationChannel = 'in_app' | 'email' | 'push';
export type ReminderType = 'events' | 'todos';

export interface NotificationPreferencesProps {
  value: NotificationPreferencesState;
  onChange: (value: NotificationPreferencesState) => void;
}

export interface NotificationPreferencesState {
  events: NotificationChannel[];
  todos: NotificationChannel[];
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
    <div className="space-y-6">
      <div>
        <div className="flex items-center mb-2">
          <Calendar className="w-5 h-5 text-accent mr-2" />
          <span className="text-white font-medium">Event Reminders</span>
        </div>
        <div className="flex gap-4">
          {channelOptions.map((opt) => (
            <motion.button
              key={opt.key}
              type="button"
              className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                value.events.includes(opt.key)
                  ? 'border-primary bg-primary/10 shadow-neon-cyan'
                  : 'border-white/20 hover:border-white/40'
              }`}
              onClick={() => handleToggle('events', opt.key)}
              whileTap={{ scale: 0.97 }}
            >
              {opt.icon}
              <span className="text-xs text-white/80 mt-1">{opt.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center mb-2">
          <CheckSquare className="w-5 h-5 text-accent mr-2" />
          <span className="text-white font-medium">To-Do Reminders</span>
        </div>
        <div className="flex gap-4">
          {channelOptions.map((opt) => (
            <motion.button
              key={opt.key}
              type="button"
              className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                value.todos.includes(opt.key)
                  ? 'border-primary bg-primary/10 shadow-neon-cyan'
                  : 'border-white/20 hover:border-white/40'
              }`}
              onClick={() => handleToggle('todos', opt.key)}
              whileTap={{ scale: 0.97 }}
            >
              {opt.icon}
              <span className="text-xs text-white/80 mt-1">{opt.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
