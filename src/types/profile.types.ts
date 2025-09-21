import { supabase } from './supabase';
import { UserProfile } from '../types/profile.types';
import type { Database } from '../types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

// ...other code...

interface UpdateProfileParams {
  userId: string;
  displayName: string;
  username: string;
  bio: string | null;
  avatarUrl: string;
  fitnessGoals: string[];
  gender: 'male' | 'female' | 'other';
  avatarFile?: File | null;
  isPublic?: boolean;
  allowFollow: boolean;
  allowDirectMessages?: boolean;
}

function updateProfile(
  client: SupabaseClient<Database>,
  userId: string,
  update: Partial<Database['public']['Tables']['profiles']['Update']>
) {
  return client
    .from('profiles')
    // @ts-ignore - Supabase types issue with the update method
    .update(update)
    .eq('id', userId)
    .select()
    .single();
}

// --- PROFILE UPDATE ---
export async function updateUserProfile({
  userId,
  displayName,
  username,
  bio,
  avatarUrl,
  fitnessGoals,
  gender,
  avatarFile,
  isPublic,
  allowFollow,
  allowDirectMessages,
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

        const timestamp = Date.now();
        const extension = (mime.split('/')?.[1] || 'png').toLowerCase();
        const filename = `avatar_${timestamp}.${extension}`;
        const filePath = `${userId}/${filename}`;

        try {
          const { data: oldFiles, error: listErr } = await supabase.storage
            .from('avatars')
            .list(userId);
          if (!listErr && oldFiles?.length) {
            const paths = oldFiles.map(f => `${userId}/${f.name}`);
            await supabase.storage.from('avatars').remove(paths);
          }
        } catch (inner) {
          console.warn('Avatar cleanup skipped due to error:', inner);
        }

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, fileToUpload, {
            cacheControl: '3600',
            contentType: mime,
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Avatar upload failed: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalAvatarUrl = `${publicUrl}?t=${timestamp}`;
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to upload avatar image');
      }
    }

    const { data: profileData, error: updateError } = await updateProfile(supabase, userId, {
      display_name: displayName,
      username,
      bio,
      avatar_url: finalAvatarUrl,
      fitness_goals: fitnessGoals,
      gender,
      ...(typeof isPublic === 'boolean' ? { is_public: isPublic } : {}),
      ...(typeof allowFollow === 'boolean' ? { allow_follow: allowFollow } : {}),
      ...(typeof allowDirectMessages === 'boolean' ? { allow_direct_messages: allowDirectMessages } : {}),
    });

    if (updateError) {
      throw updateError;
    }

    const updatedProfile: Database['public']['Tables']['profiles']['Row'] = profileData as Database['public']['Tables']['profiles']['Row'];

    if (!updatedProfile) {
      throw new Error('Failed to update profile');
    }

    return {
      data: {
        id: updatedProfile.id,
        displayName: updatedProfile.display_name || '',
        username: updatedProfile.username || '',
        bio: updatedProfile.bio || '',
        avatarUrl: updatedProfile.avatar_url || '',
        fitnessGoals: updatedProfile.fitness_goals,
        gender: updatedProfile.gender || 'other',
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
        allowDirectMessages: updatedProfile.allow_direct_messages,
        allowFollow: updatedProfile.allow_follow,
        isPublic: updatedProfile.is_public,
      },
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update profile')
    };
  }
}

// ...other code...