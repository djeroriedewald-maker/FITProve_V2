// Analytics Service - Track exercise interactions and user engagement
// Currently stores events locally until analytics database tables are available

export interface AnalyticsEvent {
  event_type: string;
  exercise_id?: string;
  user_id?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface ExerciseAnalytics {
  exercise_id: string;
  exercise_name: string;
  total_views: number;
  total_interactions: number;
  avg_engagement_score: number;
  last_viewed: string;
  popularity_trend: 'rising' | 'stable' | 'declining';
}

export interface UserEngagementMetrics {
  user_id: string;
  total_sessions: number;
  total_exercise_views: number;
  avg_session_duration: number;
  favorite_muscle_groups: string[];
  last_active: string;
}

class AnalyticsService {
  private sessionStartTime: number = Date.now();
  private currentSessionEvents: AnalyticsEvent[] = [];
  private userId: string | null = null;

  // Initialize analytics session
  async initializeSession(userId?: string) {
    this.userId = userId || null;
    this.sessionStartTime = Date.now();
    this.currentSessionEvents = [];

    await this.trackEvent('session_start', {
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }

  // Track exercise view
  async trackExerciseView(exerciseId: string, exerciseName: string, source: 'grid' | 'list' | 'search' | 'modal' = 'grid') {
    await this.trackEvent('exercise_view', {
      exercise_id: exerciseId,
      exercise_name: exerciseName,
      view_source: source,
      session_duration: Date.now() - this.sessionStartTime
    });

    // Update exercise popularity score
    await this.updateExercisePopularity(exerciseId, 'view');
  }

  // Track exercise interaction (modal open, video play, add to workout)
  async trackExerciseInteraction(
    exerciseId: string, 
    exerciseName: string, 
    interactionType: 'modal_open' | 'video_play' | 'add_to_workout' | 'detail_view',
    additionalData?: Record<string, any>
  ) {
    await this.trackEvent('exercise_interaction', {
      exercise_id: exerciseId,
      exercise_name: exerciseName,
      interaction_type: interactionType,
      session_duration: Date.now() - this.sessionStartTime,
      ...additionalData
    });

    // Update exercise popularity score with higher weight for interactions
    await this.updateExercisePopularity(exerciseId, 'interaction');
  }

  // Track search behavior
  async trackSearch(query: string, filters: any, resultCount: number) {
    await this.trackEvent('search', {
      search_query: query,
      filters: filters,
      result_count: resultCount,
      session_duration: Date.now() - this.sessionStartTime
    });
  }

  // Track filter usage
  async trackFilterUsage(filterType: 'muscle_group' | 'equipment' | 'difficulty', filterValue: string, action: 'add' | 'remove') {
    await this.trackEvent('filter_usage', {
      filter_type: filterType,
      filter_value: filterValue,
      action: action,
      session_duration: Date.now() - this.sessionStartTime
    });
  }

  // Track user engagement milestones
  async trackEngagementMilestone(milestone: 'first_exercise_view' | 'first_modal_open' | 'ten_exercises_viewed' | 'long_session') {
    await this.trackEvent('engagement_milestone', {
      milestone: milestone,
      session_duration: Date.now() - this.sessionStartTime
    });
  }

  // Generic event tracking
  async trackEvent(eventType: string, metadata?: Record<string, any>) {
    const event: AnalyticsEvent = {
      event_type: eventType,
      user_id: this.userId || 'anonymous',
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    };

    this.currentSessionEvents.push(event);

    // For now, just store locally since analytics tables don't exist yet
    this.storeEventLocally(event);
  }

  // Update exercise popularity score
  private async updateExercisePopularity(exerciseId: string, actionType: 'view' | 'interaction') {
    try {
      // For now, just log the popularity update since we don't have the column yet
      console.log(`Exercise ${exerciseId} ${actionType} recorded for popularity tracking`);
    } catch (error) {
      console.warn('Error updating exercise popularity:', error);
    }
  }

  // Store events locally as fallback
  private storeEventLocally(event: AnalyticsEvent) {
    try {
      const localEvents = JSON.parse(localStorage.getItem('fitprove_analytics') || '[]');
      localEvents.push(event);
      
      // Keep only last 100 events locally
      if (localEvents.length > 100) {
        localEvents.splice(0, localEvents.length - 100);
      }
      
      localStorage.setItem('fitprove_analytics', JSON.stringify(localEvents));
    } catch (error) {
      console.warn('Failed to store analytics locally:', error);
    }
  }

  // Sync local events to server
  async syncLocalEvents() {
    try {
      const localEvents = JSON.parse(localStorage.getItem('fitprove_analytics') || '[]');
      
      if (localEvents.length === 0) return;

      // For now, just log that we would sync these events
      console.log(`Would sync ${localEvents.length} analytics events to server`);
      
      // Don't clear localStorage yet since we don't have server sync
      // localStorage.removeItem('fitprove_analytics');
    } catch (error) {
      console.warn('Failed to sync local analytics events:', error);
    }
  }

  // Get exercise analytics
  async getExerciseAnalytics(_limit: number = 20): Promise<any[]> {
    try {
      // Since the analytics views might not exist yet, return empty array
      return [];
    } catch (error) {
      console.error('Failed to get exercise analytics:', error);
      return [];
    }
  }

  // Get user engagement metrics
  async getUserEngagementMetrics(_userId: string): Promise<any | null> {
    try {
      // Since the analytics views might not exist yet, return null
      return null;
    } catch (error) {
      console.error('Failed to get user engagement metrics:', error);
      return null;
    }
  }

  // Get trending exercises
  async getTrendingExercises(_timeframe: 'day' | 'week' | 'month' = 'week', _limit: number = 10): Promise<any[]> {
    try {
      // Since the analytics tables might not exist yet, return mock data
      return [];
    } catch (error) {
      console.error('Failed to get trending exercises:', error);
      return [];
    }
  }

  // End session tracking
  async endSession() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    
    await this.trackEvent('session_end', {
      session_duration: sessionDuration,
      total_events: this.currentSessionEvents.length,
      unique_exercises_viewed: new Set(
        this.currentSessionEvents
          .filter(e => e.metadata?.exercise_id)
          .map(e => e.metadata!.exercise_id)
      ).size
    });

    // Sync any local events
    await this.syncLocalEvents();
  }

  // Get session summary
  getSessionSummary() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    const exerciseViews = this.currentSessionEvents.filter(e => e.event_type === 'exercise_view').length;
    const interactions = this.currentSessionEvents.filter(e => e.event_type === 'exercise_interaction').length;
    const uniqueExercises = new Set(
      this.currentSessionEvents
        .filter(e => e.metadata?.exercise_id)
        .map(e => e.metadata!.exercise_id)
    ).size;

    return {
      sessionDuration,
      exerciseViews,
      interactions,
      uniqueExercises,
      engagementScore: exerciseViews + (interactions * 2)
    };
  }
}

export const analyticsService = new AnalyticsService();

// Initialize analytics when the service is imported
if (typeof window !== 'undefined') {
  analyticsService.initializeSession();
  
  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      analyticsService.trackEvent('page_hidden');
    } else {
      analyticsService.trackEvent('page_visible');
    }
  });

  // Track session end on page unload
  window.addEventListener('beforeunload', () => {
    analyticsService.endSession();
  });
}