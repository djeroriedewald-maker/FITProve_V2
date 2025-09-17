// __tests__/badges.test.ts
// Test alle badge- en admin-functies (mock Supabase)
import * as badges from '../badges';
import * as admin from '../admin';

describe('Badge API', () => {
  it('should only allow admins to create badges', async () => {
    // Mock isAdmin
    jest.spyOn(admin, 'isAdmin').mockResolvedValueOnce(true);
    const badge = {
      name: 'Test Badge',
      description: 'Test badge description',
      icon_url: '/badges/test.svg',
      type: 'achievement',
    };
    // Mock supabase insert
    jest.spyOn(badges.supabase.from('badges'), 'insert').mockReturnValue({ select: () => ({ maybeSingle: () => Promise.resolve({ data: { ...badge, id: '1', created_at: new Date().toISOString() }, error: null }) }) });
    const result = await badges.createBadge('admin-user-id', badge);
    expect(result.name).toBe('Test Badge');
  });

  it('should block non-admins from creating badges', async () => {
    jest.spyOn(admin, 'isAdmin').mockResolvedValueOnce(false);
    await expect(badges.createBadge('user-id', { name: 'X', description: 'X', icon_url: 'X', type: 'X' })).rejects.toThrow('Geen admin-rechten');
  });

  // Meer tests voor updateBadge, deleteBadge, addBadgeCriteria, etc. kunnen hier worden toegevoegd
});

describe('Admin API', () => {
  it('should return true for known admin', async () => {
    // Mock supabase
    jest.spyOn(badges.supabase.from('admin_users'), 'select').mockReturnValue({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: { id: '1' }, error: null }) }) });
    const result = await admin.isAdmin('admin-user-id');
    expect(result).toBe(true);
  });

  it('should return false for non-admin', async () => {
    jest.spyOn(badges.supabase.from('admin_users'), 'select').mockReturnValue({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) });
    const result = await admin.isAdmin('user-id');
    expect(result).toBe(false);
  });
});
