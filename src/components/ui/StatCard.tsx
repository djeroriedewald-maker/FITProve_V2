import { Clock, Heart, Dumbbell, Flame } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

interface StatCardProps {
  icon: typeof Heart | typeof Dumbbell | typeof Flame | typeof Clock;
  title: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  description?: string;
  className?: string;
  iconClassName?: string;
  animate?: boolean;
  suffix?: string;
  prefix?: string;
  bgImage?: string;
}

export const StatCard = ({
  icon: Icon,
  title,
  value,
  trend,
  description,
  className = "",
  iconClassName = "text-primary",
  animate = false,
  prefix = "",
  suffix = "",
  bgImage
}: StatCardProps) => {
  return (
    <div
      className={`group p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent relative overflow-hidden ${className}`}
      style={{
        ...(bgImage ? { background: `url(${bgImage}) top/cover no-repeat` } : {}),
        borderImage: 'linear-gradient(90deg, #00f0ff 0%, #b400ff 100%) 1',
        boxShadow: '0 0 16px 2px #b400ff55, 0 0 32px 4px #00f0ff33',
      }}
    >
      {bgImage && (
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60 pointer-events-none z-0" />
      )}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-white dark:bg-black shadow-inner group-hover:scale-110 transition-transform duration-300 bg-opacity-80 dark:bg-opacity-80">
            <Icon className={`w-6 h-6 ${iconClassName}`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{title}</h3>
            <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {typeof value === 'number' && animate ? (
                <AnimatedCounter end={value} prefix={prefix} suffix={suffix} />
              ) : (
                value
              )}
            </p>
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
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 font-medium relative z-10">{description}</p>
      )}
    </div>
  );
};
