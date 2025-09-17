// src/api/badges.ts
// Backend logica voor badge-module: ophalen, unlocken, status per user
// Supabase client wordt verwacht als dependency

import { supabase } from '../lib/supabaseClient';

// Badge ophalen (alle badges + unlocked status voor user)
export async function getAllBadgesWithStatus(userId: string) {
  // Haal alle badges op
  const { data: badges, error: badgeError } = await supabase
    .from('badges')
    .select('*');
  if (badgeError) throw badgeError;

  // Haal alle unlocked badges voor user op
  const { data: userBadges, error: userBadgeError } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);
  if (userBadgeError) throw userBadgeError;

  const unlockedIds = new Set(userBadges?.map((ub: any) => ub.badge_id));
  return badges.map((badge: any) => ({
    ...badge,
    unlocked: unlockedIds.has(badge.id),
  }));
import { isAdmin } from './admin';
}

// Badge unlocken voor user (bij event)
// Types
export type Badge = {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  type: string;
  created_at: string;
};
export type BadgeCriteria = {
  id: string;
  badge_id: string;
  event_type: string;
  event_data?: any;
  created_at: string;
};
export async function unlockBadgeForUser(userId: string, badgeId: string) {
// Admin-only: badge aanmaken
export async function createBadge(userId: string, badge: Omit<Badge, 'id' | 'created_at'>) {
  if (!(await isAdmin(userId))) throw new Error('Geen admin-rechten');
  const { data, error } = await supabase.from('badges').insert(badge).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

// Admin-only: badge updaten
export async function updateBadge(userId: string, badgeId: string, updates: Partial<Omit<Badge, 'id' | 'created_at'>>) {
  if (!(await isAdmin(userId))) throw new Error('Geen admin-rechten');
  const { data, error } = await supabase.from('badges').update(updates).eq('id', badgeId).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

// Admin-only: badge verwijderen
export async function deleteBadge(userId: string, badgeId: string) {
  if (!(await isAdmin(userId))) throw new Error('Geen admin-rechten');
  const { error } = await supabase.from('badges').delete().eq('id', badgeId);
  if (error) throw error;
  return true;
}

// Admin-only: badge criteria toevoegen
export async function addBadgeCriteria(userId: string, criteria: Omit<BadgeCriteria, 'id' | 'created_at'>) {
  if (!(await isAdmin(userId))) throw new Error('Geen admin-rechten');
  const { data, error } = await supabase.from('badge_criteria').insert(criteria).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

// Admin-only: badge criteria updaten
export async function updateBadgeCriteria(userId: string, criteriaId: string, updates: Partial<Omit<BadgeCriteria, 'id' | 'created_at'>>) {
  if (!(await isAdmin(userId))) throw new Error('Geen admin-rechten');
  const { data, error } = await supabase.from('badge_criteria').update(updates).eq('id', criteriaId).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

// Admin-only: badge criteria verwijderen
export async function deleteBadgeCriteria(userId: string, criteriaId: string) {
  if (!(await isAdmin(userId))) throw new Error('Geen admin-rechten');
  const { error } = await supabase.from('badge_criteria').delete().eq('id', criteriaId);
  if (error) throw error;
  return true;
}
  // Probeer te inserten, faalt als al bestaat (UNIQUE constraint)
  const { error } = await supabase.from('user_badges').insert({
    user_id: userId,
    badge_id: badgeId,
  });
  if (error && error.code !== '23505') throw error; // 23505 = unique violation
  return true;
}

// Alle unlocked badges voor user ophalen
export async function getUnlockedBadges(userId: string) {
  const { data, error } = await supabase
    .from('user_badges')
    .select('badge_id, unlocked_at')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

// Alle badge criteria ophalen (voor dynamische checks)
export async function getBadgeCriteria() {
  const { data, error } = await supabase
    .from('badge_criteria')
    .select('*');
  if (error) throw error;
  return data;
}
