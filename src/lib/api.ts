import { supabase } from './supabase';
import { UserProfile } from '../types/profile.types';
import type { Database } from '../types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

function updateProfile(client: SupabaseClient<Database>, userId: string, update: Partial<Database['public']['Tables']['profiles']['Update']>) {
  return client
    .from('profiles')
    // @ts-ignore - Supabase types issue with the update method
    .update(update)
    .eq('id', userId)
    .select()
    .single();
}

interface UpdateProfileParams {
  userId: string;
  displayName: string;
  username: string;
  bio: string | null;
  avatarUrl: string;
  fitnessGoals: string[];
}

export async function updateUserProfile({
  userId,
  displayName,
  username,
  bio,
  avatarUrl,
  fitnessGoals,
}: UpdateProfileParams): Promise<{ data: UserProfile | null; error: Error | null }> {
  try {
    // First, check if the username is already taken (excluding current user)
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', userId)
      .single();

    if (checkError && checkError.message !== 'No rows found') {
      throw new Error('Failed to check username availability');
    }

    if (existingUser) {
      throw new Error('Username is already taken');
    }

    // Handle avatar upload
    let finalAvatarUrl = avatarUrl;
    if (avatarUrl.startsWith('blob:') || avatarUrl.startsWith('data:')) {
      try {
        // Convert blob URL to File object
        const response = await fetch(avatarUrl);
        const blob = await response.blob();
        
        // Create a unique filename with timestamp and userId
        const timestamp = new Date().getTime();
        const extension = blob.type.split('/')[1] || 'jpg';
        const filename = `avatar_${timestamp}.${extension}`;
        const filePath = `${userId}/${filename}`;
        const file = new File([blob], filename, { type: blob.type });

        // Delete old avatar if it exists
        const { data: oldFiles } = await supabase.storage
          .from('avatars')
          .list(userId);
          
        if (oldFiles?.length) {
          await supabase.storage
            .from('avatars')
            .remove(oldFiles.map(f => `${userId}/${f.name}`));
        }

        // Upload new avatar with correct content type
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            contentType: blob.type,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Get the public URL with cache busting
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Add timestamp to prevent browser caching
        finalAvatarUrl = `${publicUrl}?t=${timestamp}`;
      } catch (error) {
        console.error('Avatar upload error:', error);
        throw new Error('Failed to upload avatar image');
      }
    }

          // @ts-ignore - Supabase types issue with the update method
    const { data: profileData, error: updateError } = await updateProfile(supabase, userId, {
      display_name: displayName,
      username,
      bio,
      avatar_url: finalAvatarUrl,
      fitness_goals: fitnessGoals,
    });

    if (updateError) {
      throw updateError;
    }

    const updatedProfile: Database['public']['Tables']['profiles']['Row'] = profileData as Database['public']['Tables']['profiles']['Row'];

    if (!updatedProfile) {
      throw new Error('Failed to update profile');
    }

    // Convert database types to frontend types
    return { 
      data: {
        id: updatedProfile.id,
        displayName: updatedProfile.display_name || '',
        username: updatedProfile.username || '',
        bio: updatedProfile.bio || '',
        avatarUrl: updatedProfile.avatar_url || '',
        fitnessGoals: updatedProfile.fitness_goals,
        memberSince: new Date(updatedProfile.created_at),
        level: updatedProfile.level,
        stats: updatedProfile.stats || {
          workoutsCompleted: 0,
          totalMinutes: 0,
          streakDays: 0,
          achievementsCount: 0,
          followersCount: 0,
          followingCount: 0
        },
        achievements: updatedProfile.achievements?.map((achievement: { 
          id: string;
          title: string;
          description: string;
          icon: string;
          unlockedAt: string | null;
          progress?: { current: number; target: number; }
        }) => ({
          ...achievement,
          unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : null
        })) || [],
        recentWorkouts: updatedProfile.recent_workouts?.map((workout: {
          id: string;
          type: string;
          title: string;
          duration: number;
          caloriesBurned: number;
          completedAt: string;
        }) => ({
          ...workout,
          completedAt: new Date(workout.completedAt)
        })) || [],
      },
      error: null 
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update profile')
    };
  }
}