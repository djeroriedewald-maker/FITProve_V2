import { supabase } from './supabase';
import { createPost } from './api';

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_id: string;
  started_at: string;
  completed_at: string | null;
  status: 'completed' | 'in_progress' | 'cancelled';
  duration?: number;
  calories_burned?: number;
  workout_name?: string;
  workout_type?: string;
}

export interface AutoPostTemplate {
  type: 'completion' | 'milestone' | 'streak' | 'achievement';
  template: string;
  emoji: string;
  priority: number;
}

// Auto-post templates with Dutch text
const AUTO_POST_TEMPLATES: AutoPostTemplate[] = [
  // Completion posts
  {
    type: 'completion',
    template: 'Net klaar met {workout_name}! 💪 {duration} minuten getraind en {calories} calorieën verbrand. #FitLife',
    emoji: '💪',
    priority: 1
  },
  {
    type: 'completion', 
    template: '🔥 {workout_name} voltooid! Voelt goed om weer te bewegen. {duration} min in de pocket!',
    emoji: '🔥',
    priority: 1
  },
  {
    type: 'completion',
    template: 'Weer een stap verder! ✅ {workout_name} gedaan - {calories} calorieën later en vol energie!',
    emoji: '✅',
    priority: 1
  },
  {
    type: 'completion',
    template: 'Training done! 🎯 {workout_name} was intensief maar zo de moeite waard. {duration} minuten voor mezelf!',
    emoji: '🎯',
    priority: 1
  },
  
  // Milestone posts (longer workouts, high calories)
  {
    type: 'milestone',
    template: '🏆 MILESTONE! Net {calories} calorieën verbrand in {duration} minuten! {workout_name} was epic!',
    emoji: '🏆',
    priority: 2
  },
  {
    type: 'milestone',
    template: '💥 WOW! {workout_name} was next level - {calories} calorieën in {duration} min! Wie doet mee morgen?',
    emoji: '💥',
    priority: 2
  },
  
  // Streak posts (multiple workouts in short time)
  {
    type: 'streak',
    template: '🔥 ON FIRE! Dit is alweer mijn {streak_count}e training deze week! Consistency is key 💪',
    emoji: '🔥',
    priority: 3
  },
  {
    type: 'streak', 
    template: '⚡ Streak mode activated! Training #{streak_count} deze week - momentum opbouwen! 🚀',
    emoji: '⚡',
    priority: 3
  }
];

// Workout type emoji mapping (used for future enhancements)
// Emoji mappings for different workout types (for future use in templates)
/*
const WORKOUT_TYPE_EMOJIS: Record<string, string> = {
  'strength': '💪',
  'cardio': '❤️',
  'hiit': '🔥',
  'yoga': '🧘',
  'flexibility': '🤸',
  'running': '🏃',
  'cycling': '🚴',
  'swimming': '🏊',
  'crossfit': '⚡',
  'pilates': '🤸‍♀️',
  'boxing': '🥊',
  'dance': '💃'
};
*/

// Auto-post settings
export interface AutoPostSettings {
  enabled: boolean;
  onWorkoutCompletion: boolean;
  onMilestones: boolean;
  onStreaks: boolean;
  minDurationMinutes: number;
  minCalories: number;
  cooldownHours: number; // Prevent spam posting
}

const DEFAULT_SETTINGS: AutoPostSettings = {
  enabled: true,
  onWorkoutCompletion: true,
  onMilestones: true,
  onStreaks: true,
  minDurationMinutes: 10, // Only post for workouts 10+ minutes
  minCalories: 50, // Only post for 50+ calories
  cooldownHours: 2 // Wait 2 hours between auto-posts
};

/**
 * Get user's auto-post settings
 */
export async function getAutoPostSettings(userId: string): Promise<AutoPostSettings> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('auto_post_settings')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      ...DEFAULT_SETTINGS,
      ...((data?.auto_post_settings as AutoPostSettings) || {})
    };
  } catch (error) {
    console.error('Error fetching auto-post settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update user's auto-post settings
 */
export async function updateAutoPostSettings(
  userId: string, 
  settings: Partial<AutoPostSettings>
): Promise<void> {
  try {
    const currentSettings = await getAutoPostSettings(userId);
    const newSettings = { ...currentSettings, ...settings };

    const { error } = await supabase
      .from('profiles')
      .update({ auto_post_settings: newSettings })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating auto-post settings:', error);
    throw new Error('Failed to update auto-post settings');
  }
}

/**
 * Check if user can auto-post (cooldown check)
 */
async function canAutoPost(userId: string, cooldownHours: number): Promise<boolean> {
  try {
    const cooldownTime = new Date();
    cooldownTime.setHours(cooldownTime.getHours() - cooldownHours);

    const { data, error } = await supabase
      .from('posts')
      .select('created_at')
      .eq('user_id', userId)
      .eq('type', 'workout')
      .gte('created_at', cooldownTime.toISOString())
      .limit(1);

    if (error) throw error;

    return !data || data.length === 0;
  } catch (error) {
    console.error('Error checking auto-post cooldown:', error);
    return false;
  }
}

/**
 * Get user's weekly workout count for streak detection
 */
async function getWeeklyWorkoutCount(userId: string): Promise<number> {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { count, error } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', oneWeekAgo.toISOString());

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Error getting weekly workout count:', error);
    return 0;
  }
}

/**
 * Select appropriate template based on workout data
 */
function selectTemplate(
  session: WorkoutSession,
  weeklyCount: number,
  settings: AutoPostSettings
): AutoPostTemplate | null {
  const duration = session.duration || 0;
  const calories = session.calories_burned || 0;

  // Check minimums
  if (duration < settings.minDurationMinutes || calories < settings.minCalories) {
    return null;
  }

  // Determine post type based on workout data
  let postType: AutoPostTemplate['type'] = 'completion';

  // Check for milestones (high calories or long duration)
  if (settings.onMilestones && (calories >= 400 || duration >= 60)) {
    postType = 'milestone';
  }

  // Check for streaks
  if (settings.onStreaks && weeklyCount >= 3) {
    postType = 'streak';
  }

  // Filter templates by type and select randomly
  const availableTemplates = AUTO_POST_TEMPLATES.filter(t => t.type === postType);
  
  if (availableTemplates.length === 0) {
    return null;
  }

  return availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
}

/**
 * Generate post content from template
 */
function generatePostContent(
  template: AutoPostTemplate,
  session: WorkoutSession,
  weeklyCount: number
): string {
  let content = template.template;

  // Replace placeholders
  content = content.replace('{workout_name}', session.workout_name || 'mijn training');
  content = content.replace('{duration}', String(session.duration || 0));
  content = content.replace('{calories}', String(session.calories_burned || 0));
  content = content.replace('{streak_count}', String(weeklyCount));

  // Add emoji if not already in template
  if (!content.includes(template.emoji)) {
    content = `${template.emoji} ${content}`;
  }

  return content;
}

/**
 * Main function: Handle workout completion and potentially create auto-post
 */
export async function handleWorkoutCompletion(session: WorkoutSession): Promise<string | null> {
  try {
    // Get user settings
    const settings = await getAutoPostSettings(session.user_id);

    // Check if auto-posting is enabled
    if (!settings.enabled || !settings.onWorkoutCompletion) {
      return null;
    }

    // Check cooldown
    const canPost = await canAutoPost(session.user_id, settings.cooldownHours);
    if (!canPost) {
      console.log('Auto-post skipped due to cooldown');
      return null;
    }

    // Get weekly workout count for streak detection
    const weeklyCount = await getWeeklyWorkoutCount(session.user_id);

    // Select appropriate template
    const template = selectTemplate(session, weeklyCount, settings);
    if (!template) {
      console.log('No suitable template found for workout');
      return null;
    }

    // Generate post content
    const content = generatePostContent(template, session, weeklyCount);

    // Create the auto-post
    const post = await createPost({
      content,
      type: 'workout',
      workoutId: session.workout_id
    });

    console.log('Auto-post created successfully:', post.id);
    return post.id;

  } catch (error) {
    console.error('Error in handleWorkoutCompletion:', error);
    return null;
  }
}

/**
 * Manually trigger auto-post for a completed workout (for testing)
 */
export async function createManualWorkoutPost(
  workoutData: {
    workoutName: string;
    workoutType: string;
    duration: number;
    caloriesBurned: number;
  }
): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create a mock session object
    const mockSession: WorkoutSession = {
      id: `manual-${Date.now()}`,
      user_id: user.id,
      workout_id: `manual-workout-${Date.now()}`,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      status: 'completed',
      duration: workoutData.duration,
      calories_burned: workoutData.caloriesBurned,
      workout_name: workoutData.workoutName,
      workout_type: workoutData.workoutType
    };

    return await handleWorkoutCompletion(mockSession);
  } catch (error) {
    console.error('Error creating manual workout post:', error);
    return null;
  }
}