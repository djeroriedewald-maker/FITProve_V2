import React from 'react';
import { Link } from 'react-router-dom';
import { Library } from 'lucide-react';

export const CommunityWorkoutsPromoCard: React.FC = () => (
  <Link to="/modules/workout/community" className="block group">
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 opacity-50" />
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm">
            <Library className="h-8 w-8 text-orange-600" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">Community</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Workouts</div>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Community Workouts</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          Browse and join workouts created by other users. See who created each workout and join the community!
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Public workouts only</span>
          <span className="inline-block px-3 py-1 bg-orange-600 text-white rounded-full text-xs font-semibold group-hover:bg-orange-700 transition-colors">View</span>
        </div>
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
    </div>
  </Link>
);
