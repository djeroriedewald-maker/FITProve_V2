-- Supabase migration: generator_workouts table for private, user-bounded generator workouts
create table if not exists generator_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz not null default now(),
  exercises jsonb not null,
  meta jsonb,
  -- add more fields as needed
  constraint user_unique_workout unique (user_id, id)
);

-- Enable Row Level Security
alter table generator_workouts enable row level security;

-- Policy: Only allow users to access their own workouts
create policy "Users can access their own generator workouts" on generator_workouts
  for all
  using (auth.uid() = user_id);
