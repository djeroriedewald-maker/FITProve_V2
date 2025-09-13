import { Clock, Heart, Dumbbell, Flame } from 'lucide-react';

interface StatCardProps {
  icon: typeof Heart | typeof Dumbbell | typeof Flame | typeof Clock;
  title: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  description?: string;
  className?: string;
  iconClassName?: string;
}

export const StatCard = ({
  icon: Icon,
  title,
  value,
  trend,
  description,
  className = "",
  iconClassName = "text-primary"
}: StatCardProps) => {
  return (
    <div className={`group p-6 rounded-xl bg-white/90 dark:bg-gray-800/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 shadow-inner group-hover:scale-110 transition-transform duration-300">
            <Icon className={`w-6 h-6 ${iconClassName}`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{title}</h3>
            <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</p>
          </div>
        </div>
        {trend && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium shadow-inner ${
            trend.isPositive
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
          }`}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </div>
        )}
      </div>
      {description && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 font-medium">{description}</p>
      )}
    </div>
  );
};