-- Add new columns to profiles table
alter table public.profiles
  add column if not exists display_name text,
  add column if not exists username text unique,
  add column if not exists bio text,
  add column if not exists fitness_goals text[] default '{}',
  add column if not exists level integer default 1,
  add column if not exists stats jsonb default '{
    "workoutsCompleted": 0,
    "totalMinutes": 0,
    "streakDays": 0,
    "achievementsCount": 0,
    "followersCount": 0,
    "followingCount": 0
  }'::jsonb,
  add column if not exists achievements jsonb[] default '{}',
  add column if not exists recent_workouts jsonb[] default '{}',
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- Add trigger to automatically update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();