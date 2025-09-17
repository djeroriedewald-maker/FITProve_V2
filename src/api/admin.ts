
// src/api/admin.ts
// Admin logica: admin-check, beheer admin users, alleen zichtbaar voor admins
import { supabase } from '../lib/supabaseClient';

export type AdminUser = {
  id: string;
  user_id: string;
  email: string;
  invited_by?: string;
  created_at: string;
};

// Check of user admin is (gebruik in frontend voor admin module zichtbaarheid)
export async function isAdmin(userId: string): Promise<boolean> {
  const id = (userId + '').trim();
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id, email')
    .eq('user_id', id)
    .maybeSingle();
  if (error) return false;
  return !!(data && data.user_id);
}

// Haal alle admins op (alleen voor admins)
export async function getAdmins(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*');
  if (error) throw error;
  return data;
}

// Admin uitnodigen (alleen voor admins)
export async function inviteAdmin(currentUserId: string, email: string): Promise<void> {
  // Zoek user_id bij email
  const { data: user, error: userError } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (userError || !user) throw new Error('User not gevonden');
  // Voeg toe aan admin_users
  const { error } = await supabase.from('admin_users').insert({
    user_id: user.id,
    email,
    invited_by: currentUserId,
  });
  if (error) throw error;
}

// Admin verwijderen (alleen voor admins, behalve jezelf niet verwijderen)
export async function removeAdmin(currentUserId: string, adminUserId: string): Promise<void> {
  if (currentUserId === adminUserId) throw new Error('Je kunt jezelf niet verwijderen');
  const { error } = await supabase
    .from('admin_users')
    .delete()
    .eq('user_id', adminUserId);
  if (error) throw error;
}
