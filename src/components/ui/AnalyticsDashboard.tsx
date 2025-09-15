import { useState, useEffect } from 'react';
import { TrendingUp, Eye, MousePointer, Users, BarChart3, Activity } from 'lucide-react';
import { analyticsService } from '../../lib/analytics.service';

interface AnalyticsDashboardProps {
  className?: string;
}

interface TrendingExercise {
  exercise_id: string;
  exercise_name: string;
  view_count: number;
  interaction_count: number;
  trend_score: number;
}

interface ExerciseAnalytics {
  exercise_id: string;
  exercise_name: string;
  total_views: number;
  total_interactions: number;
  avg_engagement_score: number;
  last_viewed: string;
  popularity_trend: 'rising' | 'stable' | 'declining';
}

interface SessionSummary {
  sessionDuration: number;
  exerciseViews: number;
  interactions: number;
  uniqueExercises: number;
  engagementScore: number;
}

export function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [trendingExercises, setTrendingExercises] = useState<TrendingExercise[]>([]);
  const [topExercises, setTopExercises] = useState<ExerciseAnalytics[]>([]);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trending' | 'popular' | 'session'>('trending');

  useEffect(() => {
    loadAnalyticsData();
    
    // Update session summary every 30 seconds
    const interval = setInterval(() => {
      setSessionSummary(analyticsService.getSessionSummary());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // For now, since the analytics tables might not exist yet,
      // we'll get session data and mock some trending data
      const sessionData = analyticsService.getSessionSummary();
      setSessionSummary(sessionData);

      // Try to get actual analytics data, but fallback to mock data if not available
      try {
        const [trending, popular] = await Promise.all([
          analyticsService.getTrendingExercises('week', 10),
          analyticsService.getExerciseAnalytics(10)
        ]);

        // Only set if we got valid data
        if (Array.isArray(trending) && trending.length > 0) {
          setTrendingExercises(trending);
        }
        if (Array.isArray(popular) && popular.length > 0) {
          setTopExercises(popular);
        }
      } catch (analyticsError) {
        console.log('Analytics data not available yet, using session data only');
        // This is expected until the analytics migrations are applied
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-orange-600" />
          Exercise Analytics
        </h3>
        
        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'trending'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => setActiveTab('popular')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'popular'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Most Popular
          </button>
          <button
            onClick={() => setActiveTab('session')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'session'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Your Session
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'trending' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Most viewed exercises this week
            </p>
            {trendingExercises.length > 0 ? (
              <div className="space-y-3">
                {trendingExercises.map((exercise, index) => (
                  <div key={exercise.exercise_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {exercise.exercise_name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {exercise.view_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MousePointer className="w-4 h-4" />
                            {exercise.interaction_count}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {exercise.trend_score.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500">score</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No trending data available yet
              </p>
            )}
          </div>
        )}

        {activeTab === 'popular' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All-time most popular exercises
            </p>
            {topExercises.length > 0 ? (
              <div className="space-y-3">
                {topExercises.map((exercise, index) => (
                  <div key={exercise.exercise_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {exercise.exercise_name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {exercise.total_views}
                          </span>
                          <span className="flex items-center gap-1">
                            <MousePointer className="w-4 h-4" />
                            {exercise.total_interactions}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(exercise.popularity_trend)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {exercise.avg_engagement_score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No popularity data available yet
              </p>
            )}
          </div>
        )}

        {activeTab === 'session' && sessionSummary && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your current session statistics
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatDuration(sessionSummary.sessionDuration)}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Views</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {sessionSummary.exerciseViews}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Interactions</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {sessionSummary.interactions}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Exercises</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {sessionSummary.uniqueExercises}
                </p>
              </div>
            </div>
            
            {/* Engagement Score */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Engagement Score
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-300">
                    Based on views and interactions
                  </p>
                </div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {sessionSummary.engagementScore}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}