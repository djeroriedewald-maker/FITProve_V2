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
  avatarFile?: File | null;
}

export async function updateUserProfile({
  userId,
  displayName,
  username,
  bio,
  avatarUrl,
  fitnessGoals,
  avatarFile,
}: UpdateProfileParams): Promise<{ data: UserProfile | null; error: Error | null }> {
  try {
    // First, check if the username is already taken (excluding current user)
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', userId)
      .maybeSingle();

    if (checkError) {
      // maybeSingle should not error on zero rows; only propagate real errors (e.g., RLS, network)
      console.error('Username availability check error:', checkError);
      throw new Error('Failed to check username availability');
    }

    if (existingUser) {
      throw new Error('Username is already taken');
    }

    // Handle avatar upload
    let finalAvatarUrl = avatarUrl;
    if (avatarFile || avatarUrl.startsWith('blob:') || avatarUrl.startsWith('data:')) {
      try {
        // Prefer provided File directly; otherwise fetch blob/data URL and create a File
        let fileToUpload: File;
        let mime: string;
        if (avatarFile) {
          fileToUpload = avatarFile;
          mime = avatarFile.type || 'image/png';
        } else {
          const response = await fetch(avatarUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch avatar blob (${response.status})`);
          }
          const blob = await response.blob();
          mime = blob.type || 'image/png';
          const fallbackExt = (mime.split('/')?.[1] || 'png').toLowerCase();
          const tempName = `avatar_tmp.${fallbackExt}`;
          fileToUpload = new File([blob], tempName, { type: mime });
        }

        // Create a unique filename with timestamp and userId
        const timestamp = Date.now();
        const extension = (mime.split('/')?.[1] || 'png').toLowerCase();
        const filename = `avatar_${timestamp}.${extension}`;
        const filePath = `${userId}/${filename}`;

        // Best-effort: delete old avatar files; ignore permission/bucket errors
        try {
          const { data: oldFiles, error: listErr } = await supabase.storage
            .from('avatars')
            .list(userId);
          if (listErr) {
            console.warn('Avatar list warning:', listErr.message);
          } else if (oldFiles?.length) {
            const paths = oldFiles.map(f => `${userId}/${f.name}`);
            const { error: removeErr } = await supabase.storage
              .from('avatars')
              .remove(paths);
            if (removeErr) {
              console.warn('Avatar remove warning:', removeErr.message);
            }
          }
        } catch (inner) {
          console.warn('Avatar cleanup skipped due to error:', inner);
        }

        // Upload new avatar with correct content type
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, fileToUpload, {
            cacheControl: '3600',
            contentType: mime,
            upsert: true,
          });

        if (uploadError) {
          console.error('Avatar upload error:', uploadError);
          // Provide clearer guidance if the bucket is missing or policies deny access
          if (/resource was not found|bucket/i.test(uploadError.message)) {
            throw new Error("Avatar upload failed: storage bucket 'avatars' not found or not accessible. Please create the bucket and policies.");
          }
          throw new Error(`Avatar upload failed: ${uploadError.message}`);
        }

        // Get the public URL with cache busting
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Add timestamp to prevent browser caching
        finalAvatarUrl = `${publicUrl}?t=${timestamp}`;
      } catch (error) {
        console.error('Avatar upload exception:', error);
        throw error instanceof Error ? error : new Error('Failed to upload avatar image');
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