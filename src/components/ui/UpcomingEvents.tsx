import { Calendar, Dumbbell, Target, Trophy } from 'lucide-react';

type Event = {
  id: string;
  title: string;
  date: Date;
  type: 'workout' | 'goal' | 'achievement';
};

const eventTypeConfig = {
  workout: {
    icon: Dumbbell,
    gradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-800 dark:text-blue-400',
    bgColor: 'bg-blue-100/50 dark:bg-blue-900/50',
  },
  goal: {
    icon: Target,
    gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
    iconColor: 'text-emerald-500',
    textColor: 'text-emerald-800 dark:text-emerald-400',
    bgColor: 'bg-emerald-100/50 dark:bg-emerald-900/50',
  },
  achievement: {
    icon: Trophy,
    gradient: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
    iconColor: 'text-purple-500',
    textColor: 'text-purple-800 dark:text-purple-400',
    bgColor: 'bg-purple-100/50 dark:bg-purple-900/50',
  },
};

export const UpcomingEvents = ({ events }: { events: Event[] }) => {
  return (
    <div className="rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl p-8 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Upcoming Events
        </h2>
        <Calendar className="w-6 h-6 text-gray-400" />
      </div>
      <div className="space-y-6">
        {events.map((event) => {
          const config = eventTypeConfig[event.type];
          const EventIcon = config.icon;
          
          return (
            <div
              key={event.id}
              className={`group flex items-center p-4 rounded-xl bg-gradient-to-br ${config.gradient} 
                shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className={`p-3 rounded-lg ${config.bgColor} mr-4 group-hover:scale-110 transition-transform duration-300`}>
                <EventIcon className={`w-5 h-5 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate mb-1">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  {event.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="ml-4">
                <div className={`px-3 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.textColor}`}>
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button className="w-full mt-6 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        View All Events
      </button>
    </div>
  );
};