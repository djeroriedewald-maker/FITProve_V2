import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mocks for Supabase client methods
const maybeSingleMock = vi.fn();
const eqMock = vi.fn();
const selectMock = vi.fn();
const upsertSingleMock = vi.fn();
const upsertSelectMock = vi.fn();
const upsertMock = vi.fn();

const getSessionMock = vi.fn();
const onAuthStateChangeMock = vi.fn();
const getUserMock = vi.fn();

vi.mock('../lib/supabase', () => {
  return {
    supabase: {
      auth: {
        getSession: (...args: any[]) => getSessionMock(...args),
        onAuthStateChange: (...args: any[]) => onAuthStateChangeMock(...args),
        getUser: (...args: any[]) => getUserMock(...args),
        signInWithOtp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      },
      from: (_table: string) => ({
        select: (...args: any[]) => selectMock(...args),
        upsert: (...args: any[]) => upsertMock(...args),
      }),
    },
  };
});

// Simple test component to display auth state
function Probe() {
  const { isLoading, profile, error } = useAuth();
  if (isLoading) return <div>loading</div>;
  if (error) return <div>error: {String(error.message)}</div>;
  if (!profile) return <div>no-profile</div>;
  return <div>profile: {profile.displayName}</div>;
}

beforeEach(() => {
  maybeSingleMock.mockReset();
  eqMock.mockReset();
  selectMock.mockReset();
  upsertSingleMock.mockReset();
  upsertSelectMock.mockReset();
  upsertMock.mockReset();
  getSessionMock.mockReset();
  onAuthStateChangeMock.mockReset();
  getUserMock.mockReset();

  // Default auth subscription mock
  onAuthStateChangeMock.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });

  // Default select chain: select('*').eq('id', userId).maybeSingle()
  selectMock.mockReturnValue({ eq: (...args: any[]) => eqMock(...args) });
  eqMock.mockReturnValue({ maybeSingle: (...args: any[]) => maybeSingleMock(...args) });

  // Default upsert chain: upsert(data, opts).select('*').single()
  upsertMock.mockReturnValue({
    select: () => ({ single: (...args: any[]) => upsertSingleMock(...args) }),
  });
});

describe('AuthProvider Supabase data fetching', () => {
  it('loads existing profile when session present', async () => {
    const user = { id: 'u1', email: 'john@example.com' } as any;
    getSessionMock.mockResolvedValue({ data: { session: { user } }, error: null });
    getUserMock.mockResolvedValue({ data: { user }, error: null });

    // Return a full profiles Row-like object
    const row = {
      id: 'u1',
      email: 'john@example.com',
      name: 'John Doe',
      display_name: 'John D',
      username: 'johnny',
      bio: 'Hi',
      avatar_url: '',
      fitness_goals: [],
      level: 2,
      stats: {
        workoutsCompleted: 1,
        totalMinutes: 2,
        streakDays: 3,
        achievementsCount: 4,
        followersCount: 5,
        followingCount: 6,
      },
      achievements: [],
      recent_workouts: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    maybeSingleMock.mockResolvedValue({ data: row, error: null });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText(/profile: John D/i)).toBeInTheDocument());
  });

  it('creates minimal profile if missing', async () => {
    const user = { id: 'u2', email: 'jane@example.com', user_metadata: { full_name: 'Jane R' } } as any;
    getSessionMock.mockResolvedValue({ data: { session: { user } }, error: null });
    getUserMock.mockResolvedValue({ data: { user }, error: null });

    // No existing row
    maybeSingleMock.mockResolvedValue({ data: null, error: null });

    // Upsert returns inserted row
    const inserted = {
      id: 'u2',
      email: 'jane@example.com',
      name: 'Jane R',
      display_name: null,
      username: null,
      bio: null,
      avatar_url: null,
      fitness_goals: [],
      level: 1,
      stats: null,
      achievements: [],
      recent_workouts: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    upsertSingleMock.mockResolvedValue({ data: inserted, error: null });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    // displayName falls back to name if display_name absent
    await waitFor(() => expect(screen.getByText(/profile: Jane R/i)).toBeInTheDocument());
  });
});
