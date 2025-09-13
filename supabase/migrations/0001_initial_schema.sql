-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_blocks enable row level security;
alter table public.sessions enable row level security;
alter table public.session_sets enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null unique,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint email_validation check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create exercises table
create table public.exercises (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  primary_muscle text not null,
  equipment text,
  media_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create workouts table
create table public.workouts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  goal text not null,
  duration_min integer not null check (duration_min > 0),
  tags text[] not null default '{}',
  signature text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create workout_blocks table
create table public.workout_blocks (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references public.workouts on delete cascade not null,
  order integer not null,
  type text not null check (type in ('exercise', 'rest', 'amrap', 'emom')),
  target text,
  reps integer,
  time_sec integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint order_validation check (order >= 0),
  constraint reps_validation check (reps is null or reps > 0),
  constraint time_validation check (time_sec is null or time_sec > 0),
  unique (workout_id, order)
);

-- Create sessions table
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles not null,
  workout_id uuid references public.workouts not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  status text not null check (status in ('in_progress', 'completed', 'cancelled')),
  
  constraint completion_validation check (
    (status = 'completed' and completed_at is not null) or
    (status != 'completed' and completed_at is null)
  )
);

-- Create session_sets table
create table public.session_sets (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions on delete cascade not null,
  block_id uuid references public.workout_blocks not null,
  set_idx integer not null check (set_idx >= 0),
  reps integer,
  weight numeric(5,2),
  time_sec integer,
  rpe integer check (rpe is null or (rpe >= 1 and rpe <= 10)),
  
  constraint reps_validation check (reps is null or reps > 0),
  constraint weight_validation check (weight is null or weight > 0),
  constraint time_validation check (time_sec is null or time_sec > 0),
  unique (session_id, block_id, set_idx)
);

-- Create badges table
create table public.badges (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  name text not null,
  description text not null,
  icon_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_badges table
create table public.user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles not null,
  badge_id uuid references public.badges not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, badge_id)
);

-- Set up Row Level Security policies

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Exercises policies (public read-only)
create policy "Exercises are viewable by everyone"
  on exercises for select
  using ( true );

-- Workouts policies (public read-only)
create policy "Workouts are viewable by everyone"
  on workouts for select
  using ( true );

-- Workout blocks policies (public read-only)
create policy "Workout blocks are viewable by everyone"
  on workout_blocks for select
  using ( true );

-- Sessions policies
create policy "Users can view own sessions"
  on sessions for select
  using ( auth.uid() = user_id );

create policy "Users can insert own sessions"
  on sessions for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own sessions"
  on sessions for update
  using ( auth.uid() = user_id );

-- Session sets policies
create policy "Users can view own session sets"
  on session_sets for select
  using ( auth.uid() = (
    select user_id from sessions where id = session_id
  ));

create policy "Users can insert own session sets"
  on session_sets for insert
  with check ( auth.uid() = (
    select user_id from sessions where id = session_id
  ));

create policy "Users can update own session sets"
  on session_sets for update
  using ( auth.uid() = (
    select user_id from sessions where id = session_id
  ));

-- Badges policies (public read-only)
create policy "Badges are viewable by everyone"
  on badges for select
  using ( true );

-- User badges policies
create policy "Users can view own badges"
  on user_badges for select
  using ( auth.uid() = user_id );

create policy "System can insert user badges"
  on user_badges for insert
  with check ( auth.uid() = user_id );