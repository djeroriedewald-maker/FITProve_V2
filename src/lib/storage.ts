import { supabase } from './supabase';

// Storage bucket names
export const BUCKET_NAMES = {
  WORKOUT_DATA: 'workout-data',
  USER_ASSETS: 'user-assets',
  PROFILE_IMAGES: 'profile-images',
} as const;

export type BucketName = typeof BUCKET_NAMES[keyof typeof BUCKET_NAMES];

/**
 * Upload a file to a specific Supabase storage bucket
 */
export const uploadFile = async (
  bucketName: BucketName,
  filePath: string,
  file: File
) => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file);

  if (error) throw error;
  return data;
};

/**
 * Get a public URL for a file in a storage bucket
 */
export const getPublicUrl = (bucketName: BucketName, filePath: string) => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
};

/**
 * Delete a file from a storage bucket
 */
export const deleteFile = async (bucketName: BucketName, filePath: string) => {
  const { error } = await supabase.storage.from(bucketName).remove([filePath]);
  if (error) throw error;
};

/**
 * List all files in a storage bucket or specific folder
 */
export const listFiles = async (bucketName: BucketName, folderPath?: string) => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(folderPath);

  if (error) throw error;
  return data;
};