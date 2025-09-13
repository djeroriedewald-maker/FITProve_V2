import { motion } from 'framer-motion';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style, ...props }) => {
  return (
    <div className={`relative overflow-hidden ${className}`} style={style} {...props}>
      <motion.div
        className="absolute inset-0 bg-gray-200 dark:bg-gray-700"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export const SkeletonStatCard = () => {
  return (
    <div className="p-6 rounded-xl bg-white/90 dark:bg-gray-800/90 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 rounded mb-2" />
          <Skeleton className="h-6 w-16 rounded" />
        </div>
      </div>
      <Skeleton className="h-4 w-32 rounded mt-3" />
    </div>
  );
};

export const SkeletonText = ({ lines = 1, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 rounded" style={{ width: `${Math.random() * 40 + 60}%` }} />
      ))}
    </div>
  );
};