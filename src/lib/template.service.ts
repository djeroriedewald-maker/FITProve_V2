import { supabase } from './supabase';
import type { WorkoutTemplate, CreateTemplateInput, UpdateTemplateInput } from '../types/template.types';

/**
 * Save a new workout template
 */
export async function saveWorkoutTemplate(input: CreateTemplateInput, userId: string) {
  const { data, error } = await supabase
    .from('workout_templates')
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description,
      preferences: input.preferences,
      tags: input.tags || [],
      use_count: 0,
    })
    .select()
    .single();

  return { data: data as WorkoutTemplate | null, error };
}

/**
 * Get all templates for a user
 */
export async function getUserTemplates(userId: string) {
  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('user_id', userId)
    .order('last_used_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  return { data: data as WorkoutTemplate[] | null, error };
}

/**
 * Get a specific template by ID
 */
export async function getTemplateById(templateId: string, userId: string) {
  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('id', templateId)
    .eq('user_id', userId)
    .single();

  return { data: data as WorkoutTemplate | null, error };
}

/**
 * Update a template
 */
export async function updateWorkoutTemplate(
  templateId: string,
  updates: UpdateTemplateInput,
  userId: string
) {
  const { data, error } = await supabase
    .from('workout_templates')
    .update(updates)
    .eq('id', templateId)
    .eq('user_id', userId)
    .select()
    .single();

  return { data: data as WorkoutTemplate | null, error };
}

/**
 * Delete a template
 */
export async function deleteWorkoutTemplate(templateId: string, userId: string) {
  const { error } = await supabase
    .from('workout_templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', userId);

  return { error };
}

/**
 * Increment use count and update last_used_at when template is used
 */
export async function markTemplateAsUsed(templateId: string, userId: string) {
  const { data, error } = await supabase
    .from('workout_templates')
    .update({
      use_count: supabase.raw('use_count + 1'),
      last_used_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .eq('user_id', userId)
    .select()
    .single();

  return { data: data as WorkoutTemplate | null, error };
}

/**
 * Search templates by tags or name
 */
export async function searchTemplates(query: string, userId: string) {
  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('user_id', userId)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  return { data: data as WorkoutTemplate[] | null, error };
}
