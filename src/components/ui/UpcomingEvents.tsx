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
    gradient: 'from-white to-white dark:from-black dark:to-black',
    iconColor: 'text-neon-yellow',
    textColor: 'text-black dark:text-white',
    bgColor: 'bg-white dark:bg-black',
  },
  goal: {
    icon: Target,
    gradient: 'from-white to-white dark:from-black dark:to-black',
    iconColor: 'text-neon-yellow',
    textColor: 'text-black dark:text-white',
    bgColor: 'bg-white dark:bg-black',
  },
  achievement: {
    icon: Trophy,
    gradient: 'from-white to-white dark:from-black dark:to-black',
    iconColor: 'text-neon-yellow',
    textColor: 'text-black dark:text-white',
    bgColor: 'bg-white dark:bg-black',
  },
};

export const UpcomingEvents = ({ events }: { events: Event[] }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-black shadow-xl p-8 border border-gray-100 dark:border-black">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Upcoming Events
        </h2>
        <Calendar className="w-6 h-6 text-neon-yellow" />
      </div>
      <div className="space-y-6">
        {events.map((event) => {
          const config = eventTypeConfig[event.type];
          const EventIcon = config.icon;
          
          return (
            <div
              key={event.id}
              className={`group flex items-center p-4 rounded-xl ${config.bgColor} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className={`p-3 rounded-lg ${config.bgColor} mr-4 group-hover:scale-110 transition-transform duration-300`}>
                <EventIcon className={`w-5 h-5 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-black dark:text-white truncate mb-1">
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
                <div className={`px-3 py-1 text-xs font-medium rounded-full border border-neon-yellow ${config.bgColor} ${config.textColor}`}>
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button className="w-full mt-6 px-4 py-3 text-sm font-medium text-black dark:text-white bg-white dark:bg-black border border-neon-yellow rounded-lg hover:bg-neon-yellow/10 dark:hover:bg-neon-yellow/10 transition-colors">
        View All Events
      </button>
    </div>
  );
};
